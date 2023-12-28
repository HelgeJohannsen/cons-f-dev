import type { LoaderArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderArgs) {
  const { admin, session } = await authenticate.admin(request);
  const shopifyResponse = await admin.rest.resources.CustomCollection.all({
    session: session,
  });

  console.log("ALL COLLECTIONS: ", shopifyResponse);

  return new Response(JSON.stringify(shopifyResponse), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
