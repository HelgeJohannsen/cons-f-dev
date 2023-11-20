import { createCheckoutState, getCheckoutByTransactionId } from "~/models/checkout.server"
import { getGraphqlClient } from "../shopify/getGraphqlClient"
import { ConsorsNotification } from "../consors/notification"

export async function orderMarkAsPaid(notification:ConsorsNotification, request: Request) {
const checkout = await getCheckoutByTransactionId(notification.transaction_id!)
if(checkout == undefined){
  console.log("no checkout found")
}else{
  const created = await createCheckoutState(checkout, notification.status, request.url, notification.creditAmount)
  console.log("created new checkout state", created)
  console.log("Checkout Shop is;",checkout.shop)
  const mut= await getGraphqlClient(checkout.shop).then(client => 
    client.query({data:{
      query: `mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
        orderMarkAsPaid(input: $input) {
          order {
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
            "id": `gid://shopify/Order/${notification.order_id}`
          }
      }
    }
  })
  ).then( response => {
/*       console.log("order paid mutation headers: ",response.headers) */
    console.log("order paid mutation body: ",response.body)
    return response
  })

  const uuid = (mut.body as any)["data"]["orderMarkAsPaid"]["userErrors"][0]
  console.log(`mut: `,uuid)
}    
}