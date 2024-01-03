import { z } from "zod";
import {
  getCheckout,
  getCheckoutByOrderId,
} from "../../../models/checkout.server";
import { getConsorsClient } from "../../consors/api";

import {
  createShopifyOrderCancelUnhandled,
  incrementCounterShopifyOrderCancelUnhandled,
} from "~/models/ShopifyOrderCancel.server";

const orderCanceled = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  current_total_price: z.string(),
  tags: z.string(),
});

export async function webbhook_oredersCancel(shop: string, payload: unknown) {
  const data = payload?.valueOf();

  const parseResult = orderCanceled.safeParse(data);

  if (parseResult.success) {
    const orderData = parseResult.data;
    // console.log("parsed oderData", orderData);
    if (orderData.tags.includes("Consors Finanzierung")) {
      console.log(
        "Cancel order because it is Consors Finanzierung:",
        orderData
      );
      const id = BigInt(orderData.id)    
      const checkout = await getCheckoutByOrderId(id);
      if (checkout == null) {
        console.error("no checkout with given uuid in database", orderData.id);
        return undefined;
      }

      //const transactionId = await getTransactionId(shop, admin_graphql_api_id)
      if (checkout.transaction_id != undefined) {
        const transaction_id = checkout.transaction_id;
        const response = await getConsorsClient(shop).then((consorsClient) =>
          consorsClient?.stornoOrder(transaction_id)
        );
        if (response === undefined) {
          console.error(`No consors Client for shop ${shop}`);
          return false;
        } else if (response.status < 200 || response.status >= 300) {
          console.error(
            `non 2xx response(${response.status}) from consorsApi.stornoOrder : `,
            await response.text()
          );
          return false;
        } else {
          return true;
        }
      }
    } else {
      // console.log("keine Consors Finanzierung");
    }
  } else {
    // console.log("could not parse calcel date:", data);
  }
}
