import { getGraphqlClient } from "../../../utils/shopify/getGraphqlClient";
import { getCheckout, getCheckoutByOrderId } from "../../../models/checkout.server";

import { z } from "zod"
import { createShopifyOrderFulfillmentUnhandled, incrementCounterShopifyOrderFulfillmentUnhandled } from "~/models/ShopifyOrderFulfillment.server";
import { getConsorsClient } from "~/utils/consors/api";

const orderFulfilled = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  current_total_price: z.string(),
  tags: z.string()
})


export async function webbhook_ordersFulfillment(shop: string, payload: unknown){
  const data = payload?.valueOf()
  
  const result = orderFulfilled.safeParse(data) 
  if(result.success){
    const orderData = result.data
    console.log("parsed oderData", orderData)
    if(orderData.tags.includes('Consors Finanzierung')){
      const createdShopifyOrderCreatedUnhandled = await createShopifyOrderFulfillmentUnhandled(shop, orderData.id, orderData.admin_graphql_api_id, orderData.current_total_price)
      console.log("createdShopifyOrderCreatedUnhandled", createdShopifyOrderCreatedUnhandled)
    }else{
      console.log("keine Consors Finanzierung")
    }
  }else{
    console.log("could not parse fullfilment date:", data)
  }
}

interface OrderQueueEntry{
  orderId: bigint
  shop: string
  counter: number
  admin_graphql_api_id: string;
  current_total_price: string;
  createdAt: Date;
}

export async function handleFulfillmentQueue({shop, orderId, admin_graphql_api_id, counter, createdAt }: OrderQueueEntry){
  console.log("handling orderQueue Entry")

  console.log("handling orderCancelQueue Entry")
  
  const runAt = new Date(createdAt.getTime())

  runAt.setHours(runAt.getHours()+counter)

  if(runAt.getTime()>Date.now()){
    console.log("skipping orderCancelQueue entry")
    return false
  }

  await incrementCounterShopifyOrderFulfillmentUnhandled(orderId)

  const checkout = await getCheckoutByOrderId(orderId)
  //const transactionIdMeta = await getTransactionId(shop, admin_graphql_api_id)
  //const paymentState = await getPaymentState(shop, admin_graphql_api_id)
  const transactionId = checkout?.transaction_id
  if(transactionId != undefined){
    console.log("new checkout transactionId:", transactionId)
    const response = await getConsorsClient(shop)
      .then(consorsClient => consorsClient?.fulfillmentOrder(transactionId))
    if(response === undefined){
      console.error(`No consors Client for shop ${shop}`)  
      return false
    }else if(response.status < 200 || response.status >= 300 ){
      console.error(`non 2xx response(${response.status}) from consorsApi.fulfillmentOrder : `, await response.text())
      return false
    }else{
      return true
    }
  }else{
    console.error("no transaction id in metafield for ", admin_graphql_api_id)
    return false
  }
}
