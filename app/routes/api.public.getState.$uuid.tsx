import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { getCheckoutState } from "../models/checkout.server";

import { EventStream } from "remix-sse";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno

import { json, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request, params }) => {
  let transferedCheckoutState = 0;

  const uuid = params.uuid!;

  const checkoutState = await getCheckoutState({ uuid }); // TODO: is it valide to assume uuid is present on this Route ?

  if (checkoutState.length == 0) {
    const response = json({ state: "unknown" });
    response.headers.append("Access-Control-Allow-Origin", "*");
    return response;
  } else {
    const response = json({
      state: checkoutState[0].state,
      creditAmount: checkoutState[0].creditAmount,
    });
    response.headers.append("Access-Control-Allow-Origin", "*");
    return response;
  }
};
