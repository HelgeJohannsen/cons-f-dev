import type { LoaderArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderArgs) {
  const { admin, session } = await authenticate.admin(request);
  const response = await admin.rest.resources.CustomCollection.all({
    session: session,
  });

  console.log("ALL COLLECTIONS: ", response);
}
