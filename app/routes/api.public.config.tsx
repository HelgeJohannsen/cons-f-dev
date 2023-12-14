import { authenticate } from "../shopify.server";
import db from "../db.server";
import { json, redirect } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Button } from "@shopify/polaris";

import { getPublicConfig } from "../models/config.server";

export async function loader({ request }: LoaderArgs) {
  /**
   * Returnes the consors config (vendorId, etc.)
   */
  console.log("requestedURL: ", request.url);

  const requestedURL = new URL(request.url);
  const shop = requestedURL.searchParams.get("shop");
  if (shop == null) {
    throw new Response(
      "Bad Request" /*", query parameter shop is mandatory"*/,
      {
        status: 400,
      }
    );
  }
  console.log("shop", shop);
  const config = await getPublicConfig(shop);
  if (config == null) {
    throw new Response("shop not found", {
      status: 404,
    });
  }
  const response = json(config);
  response.headers.append("Access-Control-Allow-Origin", "*");
  return response;
}
