import type { LoaderArgs } from "@remix-run/node";
import {
  getCheckout,
  createCheckoutState,
  checkoutAddTransactionId,
  getCheckoutByTransactionId,
  createCheckoutByOrderID,
} from "../models/checkout.server";
import {
  checkNotifyHash,
  consorsNotification,
} from "../utils/consors/notification";
import { z } from "zod";
import { authenticate } from "../shopify.server";
import { orderMarkAsPaid } from "~/utils/graphql/markAsPaid";
import { addTags } from "~/utils/graphql/order";
import { checkIfOrderExists } from "~/utils/graphql/order";

export async function loader({ request }) {
  console.log("loeader")
  console.log("notify Request:", request.url);
  const appUrl = "https://sleeve-permit-sky-gadgets.trycloudflare.com"
  const requestedURL = new URL(request.url);
  const orderid = requestedURL.searchParams.get("orderId");
  try {
    const apiEndpoint = "/api/notify";

    const parameters = new URLSearchParams({ orderID: orderid? });
    const requestUrl = `${appUrl}${apiEndpoint}?${parameters}`;
    console.log("requestUrl", requestUrl)
    const response = await fetch(requestUrl, { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("response", data)
  } catch (error) {
    console.error("Error fetching AppConfig:", error);
  }
  return new Response("OK", {
    status: 200,
  });
}
export async function action({ request, params }: LoaderArgs) {
  console.log("action")
  console.log("notify Request:", request.url);
  return new Response("OK", {
    status: 200,
  });
}
