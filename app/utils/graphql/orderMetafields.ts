import { getCheckout } from "~/models/checkout.server";
import { getGraphqlClient } from "../shopify/getGraphqlClient";

export async function getTransactionId(
  shop: string,
  admin_graphql_api_id: string
) {
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
      order(    id: "${admin_graphql_api_id}") {
        metafield(namespace: "consors", key: "consorsUUID"){
          value
        }
      }
    }`;
  const metaFields = await gqlClient.query({ data: { query } });
  const uuid = (metaFields.body as any)["data"]["order"]["metafield"]["value"];

  console.log("uuid from Metafield", uuid);
  // TODO: check if metafield is set

  const checkout = await getCheckout(uuid);
  console.log("checkout:", checkout);
  if (checkout == null) {
    console.error("no checkout with given uuid in database", uuid);
    return undefined;
  }

  const transaction_id = checkout.transaction_id;
  if (transaction_id == null) {
    console.error("checkout has no transaction_id", uuid);
    return undefined;
  }
  return transaction_id;
}
export async function getPaymentState(
  shop: string,
  admin_graphql_api_id: string
) {
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
      order(    id: "${admin_graphql_api_id}") {
        metafield(namespace: "consors", key: "state"){
          value
        }
      }
    }`;
  const metaFields = await gqlClient.query({ data: { query } });
  const state = (metaFields.body as any)["data"]["order"]["metafield"]["value"];

  console.log("state from Metafield", state);
  // TODO: check if metafield is set

  if (state == null) {
    console.error("order has no state object", state);
    return undefined;
  }
  return state;
}
export async function getConsorsused(
  shop: string,
  admin_graphql_api_id: string
) {
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
      order(    id: "${admin_graphql_api_id}") {
        metafield(namespace: "consors", key: "used"){
          value
        }
      }
    }`;
  const metaFields = await gqlClient.query({ data: { query } });
  try {
    const used = (metaFields.body as any)["data"]["order"]["metafield"][
      "value"
    ];
    console.log("used from Metafield", used);
    // TODO: check if metafield is set
    if (used == null) {
      console.error("order has no used Consors object", used);
      return undefined;
    }
    return used;
  } catch (error) {
    return false;
  }
}
