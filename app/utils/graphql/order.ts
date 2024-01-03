import { getGraphqlClient } from "../shopify/getGraphqlClient";

export async function checkIfOrderExists(shop: string, order_id: string) {
  const orderGlobalIdentifier = "gid://shopify/Order/" + order_id
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
        order(id: "${orderGlobalIdentifier}"){
            name
      }
    }`;
    console.log("orderGlobalIdentifier",orderGlobalIdentifier)
  const name = await gqlClient.query({ data: { query } });
  const orderID = (name.body as any)["data"]["order"]["name"];

  if (orderID == null) {
    console.error("order does not exist", orderID);
    return false;
  }
  return true;
}