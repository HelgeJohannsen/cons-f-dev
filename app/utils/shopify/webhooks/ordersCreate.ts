import { setOrderId, getCheckoutByOrderId } from "../../../models/checkout.server";

import { getConsorsused } from "../../../utils/graphql/orderMetafields";

import { z } from "zod"
import { getConsorsClient } from "../../consors/api";
import { createShopifyOrderCreatedUnhandled, incrementCounterShopifyOrderCreatedUnhandled } from "../../../models/ShopifyOrderCreated.server";
import { addTags } from "~/utils/graphql/orderTags";
import { isAppLive } from "~/models/config.server";

const orderCreated = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  current_total_price: z.string(),
  checkout_token: z.string().nullish(),
  payment_gateway_names: z.string().array()
})


  
export async function webbhook_oredersCreate(shop: string, payload: unknown){
  const data = payload?.valueOf()
  console.log(data)  // as https://shopify.dev/docs/api/admin-rest/2023-01/resources/webhook#event-topics-orders-create
  
  if( orderCreated.safeParse(data)){
    const orderData = orderCreated.parse(data)
    console.log("parsed oderData", orderData)
    console.log("payment_gateway_names", orderData.payment_gateway_names[0])
    const isLive = await isAppLive(shop)

    if(orderData.checkout_token == undefined){
      console.log("ignoring order, no checkout token", orderData)
    }else{
      //console.log("consorsUsed", consorsUsed)
      if(isLive){
        if(
            orderData.payment_gateway_names.includes("Ratenzahlung") || 
            orderData.payment_gateway_names.includes("Consors Finanzierung") || 
            orderData.payment_gateway_names.includes("Finanzierung by Consors Finanz") 
        ){
          const tags = await addTags(shop, orderData.admin_graphql_api_id, "Consors Finanzierung")
          const createdShopifyOrderCreatedUnhandled = await setOrderId(orderData.checkout_token, orderData.id).then(
            ()=> createShopifyOrderCreatedUnhandled(shop, orderData.id, orderData.admin_graphql_api_id, orderData.current_total_price)
          )
          console.log("createdShopifyOrderCreatedUnhandled", createdShopifyOrderCreatedUnhandled)
        }else{
          const consorsUsed = await getConsorsused(shop, orderData.admin_graphql_api_id)
          console.log("Consors Payment not used",consorsUsed)
          return false
        }
      }else{
        console.log("Order not handled becauseApp is offline",)
      }
    }
  }else{
    console.log("could not parse created Data:", data)
  }
  // const transactionId = await getTransactionId(shop, orderData.admin_graphql_api_id)
  // if(transactionId != undefined){
  //   await consorsApi.provideOrderId(transactionId, orderData.id)
  // }else{
  //   console.error("no transaction id in metafield for ", orderData.admin_graphql_api_id)
  // }
}

interface OrderQueueEntry{
  orderId: bigint
  shop: string
  counter: number
  admin_graphql_api_id: string;
  current_total_price: string;
  createdAt: Date;
}   

export async function handleOrderQueue({shop, orderId, admin_graphql_api_id, current_total_price, counter, createdAt }: OrderQueueEntry){
  console.log("handling orderQueue Entry")
  
  const runAt = new Date(createdAt.getTime())

  runAt.setHours(runAt.getHours()+counter)

  if(runAt.getTime()>Date.now()){
    console.log("skipping orderQueue entry")
    return false
  }

  await incrementCounterShopifyOrderCreatedUnhandled(orderId)

  const checkout = await getCheckoutByOrderId(orderId)
  //const transactionIdMeta = await getTransactionId(shop, admin_graphql_api_id)

  const transactionId = checkout?.transaction_id
  if(transactionId != undefined){

    console.log("new checkout transactionId:", transactionId)
    // TODO: current_total_price === proposal Amount
    const response = await getConsorsClient(shop)
      .then(consorsClient => consorsClient?.provideOrderId(transactionId, orderId))
    if(response === undefined){
      console.error(`No consors Client for shop ${shop}`)  
      return false
    }else if(response.status < 200 || response.status >= 300 ){
      console.error(`non 2xx response(${response.status}) from consorsApi.provideOrderId : `, await response.text())
      return false
    }else{
      return true
    }
  }else{
    console.error("no transaction id in metafield for ", admin_graphql_api_id)
    return false
  }
}
