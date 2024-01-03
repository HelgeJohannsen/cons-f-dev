import type { LoaderArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { checkIfProductHasCollection } from "~/utils/graphql/product";

export async function loader({ request }: LoaderArgs) {
  const shop = "helge-test.myshopify.com"
  const res = await checkIfProductHasCollection(shop,"")

  console.log("res: ", res);

  return new Response(JSON.stringify(res), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
