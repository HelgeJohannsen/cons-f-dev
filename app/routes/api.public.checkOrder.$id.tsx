import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { getCheckout2, getCheckoutByOrderId, getCheckoutState } from "../models/checkout.server";

import { EventStream } from "remix-sse";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno

import { json, redirect } from "@remix-run/node";
import { checkPayment } from "~/utils/graphql/order";
import { authenticate } from "~/shopify.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const order_id =  BigInt(params.id!)
  const c2 = await getCheckout2(params.id!)
  console.log("c2", c2)
  const checkout = await getCheckoutByOrderId(order_id)
  if(checkout == null) {
    const response = json(false);
    response.headers.append("Access-Control-Allow-Origin", "*");
    return response;
  }else{
    const response = json(true);
    response.headers.append("Access-Control-Allow-Origin", "*");
    return response;
  }
};