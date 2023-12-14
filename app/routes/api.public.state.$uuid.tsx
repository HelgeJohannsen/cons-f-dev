import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { z } from "zod";
import { getCheckoutState } from "../models/checkout.server";

import { EventStream } from "remix-sse";
import type { HeadersFunction } from "@remix-run/node"; // or cloudflare/deno

const checkIntervall = 5000;

export const loader: LoaderFunction = async ({ request, params }) => {
  console.log("process.env.SHOPIFY_APP_URL", process.env.SHOPIFY_APP_URL);
  let transferedCheckoutState = 0;

  const uuid = params.uuid!;

  const es = new EventStream(request, (send) => {
    let inProgress = false;

    const halderFunction = async () => {
      if (inProgress) {
        console.log(`handler in progress for ${uuid}, skipping`);
        return;
      } else {
        inProgress = true;
        const checkoutState = await getCheckoutState({ uuid }); // TODO: is it valide to assume uuid is present on this Route ?
        if (checkoutState.length > transferedCheckoutState) {
          const stateToTransfer = checkoutState[checkoutState.length - 1];
          send("state", stateToTransfer.state);
          transferedCheckoutState = checkoutState.length;
        } else {
          send("heartbeat", "test");
        }
        inProgress = false;
      }
    };

    const intervall = setInterval(halderFunction, checkIntervall);

    return () => {
      clearInterval(intervall);
    };
  });

  es.headers.append("Access-Control-Allow-Origin", "*");
  return es;
};
