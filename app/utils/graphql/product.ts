import { getGraphqlClient } from "../shopify/getGraphqlClient";

export async function checkIfProductHasCollection(shop: string, productid: string) {
    const productGlobalIdentifier = "gid://shopify/Product/8301155221783"  
  const collectionGlobalIdentifier = "gid://shopify/Collection/467696386327"
  const gqlClient = await getGraphqlClient(shop);
  const query = `{
    product(id: "gid://shopify/Product/8301155221783") {
      inCollection(id: "${collectionGlobalIdentifier}")
    }
  }`;
    console.log("collectionGlobalIdentifier",collectionGlobalIdentifier)
  const name = await gqlClient.query({ data: { query } });
  const aktionszins = (name.body as any)["data"]["product"]["inCollection"];
  console.log("aktionszins",aktionszins)

  return aktionszins;
}