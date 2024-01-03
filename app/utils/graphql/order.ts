import { getGraphqlClient } from "../shopify/getGraphqlClient";

export async function checkIfOrderExists(shop: string, order_id: string) {
  const orderGlobalIdentifier = "gid://shopify/Order/" + order_id
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
    order(id: "gid://shopify/Order/5534614749463"){
        tags
  }
}`;
const metaFields = await gqlClient.query({ data: { query } });
const tags = (metaFields.body as any)["data"]["order"]["tags"];
  console.log("tags", tags)

  if (tags == null) {
    console.error("order does not exist", tags);
    return false;
  }
  return true;
}