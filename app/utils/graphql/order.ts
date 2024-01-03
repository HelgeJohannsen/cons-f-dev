import { getGraphqlClient } from "../shopify/getGraphqlClient";

export async function checkIfOrderExists(shop: string, order_id: string) {
  const orderGlobalIdentifier = "gid://shopify/Order/" + order_id
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
        order(id: "${orderGlobalIdentifier}"){
            id
      }
    }`;
  const id = await gqlClient.query({ data: { query } });
  const orderID = (id.body as any)["data"]["order"]["id"];

  if (orderID == null) {
    console.error("order does not exist", orderID);
    return false;
  }
  return true;
}