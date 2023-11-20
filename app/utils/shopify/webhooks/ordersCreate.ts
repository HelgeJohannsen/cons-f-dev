import { setOrderId, getCheckout, getCheckoutByOrderId } from "../../../models/checkout.server";

import { getConsorsused, getPaymentState, getTransactionId } from "../../../utils/graphql/orderMetafields";

import { z } from "zod"
import { getConsorsClient } from "../../consors/api";
import { createShopifyOrderCreatedUnhandled } from "../../../models/ShopifyOrderCreated.server";
import { addTags } from "~/utils/graphql/orderTags";

const orderCreated = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  current_total_price: z.string(),
  checkout_token: z.string()
})


  
export async function webbhook_oredersCreate(shop: string, payload: unknown){
  const data = payload?.valueOf()
  console.log(data)  // as https://shopify.dev/docs/api/admin-rest/2023-01/resources/webhook#event-topics-orders-create
  const orderData = orderCreated.parse(data)
  console.log("parsed oderData", orderData)
  const consorsUsed = await getConsorsused(shop, orderData.admin_graphql_api_id)
  console.log("consorsUsed", consorsUsed)

  if(consorsUsed === "true"){
    const tags = await addTags(shop, orderData.admin_graphql_api_id, "Consors Finanzierung")
    const createdShopifyOrderCreatedUnhandled = await setOrderId(orderData.checkout_token, orderData.id).then(
      ()=> createShopifyOrderCreatedUnhandled(shop, orderData.id, orderData.admin_graphql_api_id, orderData.current_total_price)
    )
    console.log("createdShopifyOrderCreatedUnhandled", createdShopifyOrderCreatedUnhandled)
  }else{
    console.log("Consors Payment not used",consorsUsed)
    return false
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
  admin_graphql_api_id: string;
  current_total_price: string;
  createdAt: Date;
}   

export async function handleOrderQueue({shop, orderId, admin_graphql_api_id, current_total_price }: OrderQueueEntry){
  console.log("handling orderQueue Entry")

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
    }else if(response.status != 200){
      console.error(`non 200 response(${response.status}) from consorsApi.provideOrderId : `, await response.text())
      return false
    }else{
      return true
    }
  }else{
    console.error("no transaction id in metafield for ", admin_graphql_api_id)
    return false
  }
}
