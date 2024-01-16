import type { LoaderArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { checkIfProductHasCollection } from "~/utils/graphql/product";

export async function loader({ request,params }: LoaderArgs) {
  const shop = process.env.SHOPIFY_SHOP
  if(!shop){
    console.log("shop undefined")
    return false
  }
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
