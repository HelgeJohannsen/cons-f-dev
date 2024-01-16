import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { getCheckout, getCheckoutByOrderId, getCheckoutState } from "../models/checkout.server";

import { EventStream } from "remix-sse";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno

import { json, redirect } from "@remix-run/node";


export const loader: LoaderFunction = async ({ request, params }) => {
//  const order_id =  BigInt(params.id!)
  const checkout = await getCheckout(params.id!)
  console.log("checkout", checkout)
 // const checkout = await getCheckoutByOrderId(order_id)
  if(!checkout) {
    const response = json(false);
    response.headers.append("Access-Control-Allow-Origin", "*");
    return response;
  }else{
    const response = json(true);
    response.headers.append("Access-Control-Allow-Origin", "*");
    return response;
  } 
};