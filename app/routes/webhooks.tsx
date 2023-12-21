import { authenticate } from "../shopify.server";
import db from "../db.server";
import { createOrder, getOrder } from "../models/order.server";
import { getCheckout } from "../models/checkout.server";

import { z } from "zod";

import { webbhook_oredersCreate } from "../utils/shopify/webhooks/ordersCreate";
import { webbhook_oredersCancel as cancelOrderToConsors } from "~/utils/shopify/webhooks/ordersCancel";
import { webbhook_ordersFulfillment } from "~/utils/shopify/webhooks/ordersFulfillment";

export const action = async ({ request }) => {
  // await console.log("got a webhook");
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  // console.log("authenticated, ", topic, shop);
  try {
    switch (topic) {
      case "APP_UNINSTALLED":
        return new Response("deleted session", { status: 200 });
        if (session) {
          await db.session.deleteMany({ where: { shop } });
        }

      case "ORDERS_CREATE":
        webbhook_oredersCreate(shop, payload);
        // console.log("Bestellung erstellt:", payload);
        return new Response("webhook ORDERS_CREATE", { status: 200 });

      case "ORDERS_FULFILLED":
        // console.log("ORDERS_FULFILLED ");
        webbhook_ordersFulfillment(shop, payload);
        return new Response("webhook ORDERS_FULFILLED", { status: 200 });
      case "ORDERS_CANCELLED":
       if(await cancelOrderToConsors(shop, payload)){
        return new Response("webhook ORDERS_CANCELLED", { status: 200 });
       }
      

      /*     const data2 = payload?.valueOf()
      console.log(data2)  // as https://shopify.dev/docs/api/admin-rest/2023-01/resources/webhook#event-topics-orders-create
      const order = orderCreated.parse(data2)
      console.log("parsed Storno oderData", order)

      const transactionIdStorno = "20231004081394166560"//await getTransactionId(shop, order.admin_graphql_api_id)
      if(transactionIdStorno != undefined){
        const res = await consorsApi.stornoOrder(transactionIdStorno)
        console.log("STORNO TransactionID:",res)
      }
  */
      case "CUSTOMERS_DATA_REQUEST":
      case "CUSTOMERS_REDACT":
      case "SHOP_REDACT":
      default:
        return new Response("Unhandled webhook topic", { status: 200 });
    }
  } catch (error) {
    console.error(`Error handeling webhook ${topic}`, error);
    return new Response("Webhook Error", { status: 200 });
  }
};
