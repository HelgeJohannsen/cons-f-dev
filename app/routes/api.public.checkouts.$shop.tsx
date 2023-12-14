import { json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";

import { getOrCreateCheckout } from "../models/checkout.server";

export async function action({ request, params }: ActionArgs) {
  /**
   * creates a new checkout for the given shop(URL parameter) and returnes the uuid
   */
  console.log("start");
  const requestedURL = new URL(request.url);
  const shop = params.shop;
  const checkoutToken = requestedURL.searchParams.get("checkoutToken");

  if (shop == null || checkoutToken == null) {
    // TODO: Propably not needed
    throw new Response(
      "Bad Request" /*", query parameter shop is mandatory"*/,
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
  const dbCreate = await getOrCreateCheckout(shop, checkoutToken)
    .then((checkout) =>
      json(
        {
          uuid: checkout?.uuid,
          //notifyUrl:`http://${requestedURL.hostname}/api/public/notify/${checkout.uuid}`
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    )
    .catch((reason) => {
      console.log("Error: ", reason);
      return new Response("Could not create new Checkout", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    });
  // TODO: check if entry creation was successful

  console.log("db Create: ", dbCreate);
  console.log("requestedURL: ", request.url);

  return dbCreate;
}
