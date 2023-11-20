import db from "../db.server";

export function createShopifyOrderFulfillmentUnhandled(shop: string, orderId: number, admin_graphql_api_id: string, current_total_price: string ){
    return db.shopifyOrderFulfillmentUnhandled.create({
        data: {
            orderId: orderId,
            shop: shop,
            admin_graphql_api_id,
            current_total_price,
        }
    })
}

export function getShopifyOrderFulfillmentUnhandled( ){
    const order = db.shopifyOrderFulfillmentUnhandled.findMany()
    return order
}
    
export async function removeFromOrderFulfillmentQueue(orderId: bigint){
    const order = await db.shopifyOrderFulfillmentUnhandled.findUnique({where:{orderId}})
    if(order == null){
        return false
    }

    const handledOrder = await db.shopifyOrderFulfillmentHandled.create({
        data: order
    })
    await db.shopifyOrderFulfillmentUnhandled.delete({where:{orderId}})

    return true
}
