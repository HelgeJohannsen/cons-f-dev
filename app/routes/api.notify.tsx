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
