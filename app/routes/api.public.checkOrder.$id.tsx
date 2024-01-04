import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { getCheckoutState } from "../models/checkout.server";

import { EventStream } from "remix-sse";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno

import { json, redirect } from "@remix-run/node";
import { checkPayment } from "~/utils/graphql/order";

export const loader: LoaderFunction = async ({ request, params }) => {
  let transferedCheckoutState = 0;

  const id = params.id!;

  const res =  await checkPayment("helge-test.myshopify.com",id )
  console.log("res", res)
  if (res == null) {
    throw new Response("shop not found", {
      status: 404,
    });
  }
  const response = json(res);
  response.headers.append("Access-Control-Allow-Origin", "*");
  return response;
};