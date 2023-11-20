import { getGraphqlClient } from "../../../utils/shopify/getGraphqlClient";
import { getCheckout, getCheckoutByOrderId } from "../../../models/checkout.server";

import { createOrder, getOrder } from "../../../models/order.server";

import { z } from "zod"
import { createShopifyOrderFulfillmentUnhandled } from "~/models/ShopifyOrderFulfillment.server";
import { getConsorsClient } from "~/utils/consors/api";

const orderFulfilled = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  current_total_price: z.string(),
  tags: z.string()
})

async function getTransactionId(shop:string, admin_graphql_api_id:string) {
  const gqlClient = await getGraphqlClient(shop)
  const query = `{
    order(    id: "${admin_graphql_api_id}") {
      metafield(namespace: "consors", key: "consorsUUID"){
        value
      }
    }
  }`
  const metaFields = await gqlClient.query({data:{query}})
  const uuid = (metaFields.body as any)["data"]["order"]["metafield"]["value"]
  
  console.log("uuid", uuid)
  // TODO: check if metafield is set

  const checkout = await getCheckout(uuid)
  console.log("checkout:" ,checkout)
  if(checkout == null){
    console.error("no checkout with given uuid in database", uuid)
    return undefined
  }

  const transaction_id = checkout.transaction_id
  if(transaction_id == null){
    console.error("checkout has no transaction_id", uuid)
    return undefined
  }
  return transaction_id
}
  
export async function webbhook_ordersFulfillment(shop: string, payload: unknown){
  const data = payload?.valueOf()
  console.log(data)  // as https://shopify.dev/docs/api/admin-rest/2023-01/resources/webhook#event-topics-orders-create
  const orderData = orderFulfilled.parse(data)
  console.log("parsed oderData", orderData)
  if(orderData.tags.includes('Consors Finanzierung')){
  const createdShopifyOrderCreatedUnhandled = await createShopifyOrderFulfillmentUnhandled(shop, orderData.id, orderData.admin_graphql_api_id, orderData.current_total_price)
  console.log("createdShopifyOrderCreatedUnhandled", createdShopifyOrderCreatedUnhandled)
  // const transactionId = await getTransactionId(shop, orderData.admin_graphql_api_id)
  // if(transactionId != undefined){
  //   await consorsApi.provideOrderId(transactionId, orderData.id)
  // }else{
  //   console.error("no transaction id in metafield for ", orderData.admin_graphql_api_id)
  // }
  }else{
    console.log("keine Consors Finanzierung")
  }
}

interface OrderQueueEntry{
  orderId: bigint
  shop: string
  admin_graphql_api_id: string;
  current_total_price: string;
  createdAt: Date;
}

export async function handleFulfillmentQueue({shop, orderId, admin_graphql_api_id }: OrderQueueEntry){
  console.log("handling orderQueue Entry")
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
