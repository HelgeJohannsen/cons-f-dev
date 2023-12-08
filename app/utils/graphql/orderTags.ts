import { getGraphqlClient } from "../shopify/getGraphqlClient"

export async function getOrderTags(shop:string, admin_graphql_api_id:string) {
    const gqlClient = await getGraphqlClient(shop)
    const query = `{
        order(id: "${admin_graphql_api_id}"){
            tags
      }
    }`
    const metaFields = await gqlClient.query({data:{query}})
    const tags = (metaFields.body as any)["data"]["order"]["tags"]
    
    console.log("tags from order", tags)
    // TODO: check if metafield is set

    if(tags == null){
      console.error("order has no tags", tags)
      return undefined
    }
    return tags
  }
export async function addTags(shop:string, admin_graphql_api_id:string, tag: string) {
  const oldTags = await getOrderTags(shop,admin_graphql_api_id)
  console.log("oldTags",oldTags)
  const newTagArray = oldTags.concat([tag]); 
  console.log("newArray",newTagArray)
  await getGraphqlClient(shop).then(client => 
    client.query({data:{
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
      variables:{
          "input": {
            "id": admin_graphql_api_id,
            "tags": newTagArray
          }
      }
    }
  })
  ).then( response => {
    // TODO: may need error handeling ?
    console.log("tags query headers: ",response.headers)
    console.log("tags query body: ",response.body)
  })
}