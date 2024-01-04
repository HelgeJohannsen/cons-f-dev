import { getGraphqlClient } from "../shopify/getGraphqlClient";
export async function checkPayment(shop: string, productid: string) {
  const orderGlobalIdentifier = "gid://shopify/Order/" + productid 
const gqlClient = await getGraphqlClient(shop);
console.log("client", gqlClient)
const query = `{
	order(id: "gid://shopify/Order/5534614749463") {
		paymentGatewayNames
	}
}`;
const paymentGatewayNames = await gqlClient.query({ data: { query } });
console.log("pay", paymentGatewayNames)
console.log("pay2", paymentGatewayNames.body as any)["data"];
const paymentGatewayName = (paymentGatewayNames.body as any)["data"]["order"]["paymentGatewayNames"];
//console.log("aktionszins",aktionszins)

return paymentGatewayName;
}
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

export async function getOrderTags(shop: string, admin_graphql_api_id: string) {
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
        order(id: "${admin_graphql_api_id}"){
            tags
      }
    }`;
  const metaFields = await gqlClient.query({ data: { query } });
  const tags = (metaFields.body as any)["data"]["order"]["tags"];

  // console.log("tags from order", tags);
  // TODO: check if metafield is set

  if (tags == null) {
    console.error("order has no tags", tags);
    return undefined;
  }
  return tags;
}
export async function addTags(
  shop: string,
  admin_graphql_api_id: string,
  tag: string
) {
  const oldTags = await getOrderTags(shop, admin_graphql_api_id);
  // console.log("oldTags", oldTags);
  const newTagArray = oldTags.concat([tag]);
  // console.log("newArray", newTagArray);
  await getGraphqlClient(shop)
    .then((client) =>
      client.query({
        data: {
          query: `mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            tags
            unpaid
          }
          userErrors {
            field
            message
          }
        }
      }`,
          variables: {
            input: {
              id: admin_graphql_api_id,
              tags: newTagArray,
            },
          },
        },
      })
    )
    .then((response) => {
      // TODO: may need error handeling ?
      // console.log("tags query headers: ", response.headers);
      // console.log("tags query body: ", response.body);
    });
}
