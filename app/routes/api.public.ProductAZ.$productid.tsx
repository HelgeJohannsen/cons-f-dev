import type { LoaderArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { checkIfProductHasCollection } from "~/utils/graphql/product";

export async function loader({ request,params }: LoaderArgs) {
  const shop = "helge-test.myshopify.com"
  if(params.productid != null){
    const res = await checkIfProductHasCollection(shop, params.productid!)
  
    return new Response(JSON.stringify(res), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
}
