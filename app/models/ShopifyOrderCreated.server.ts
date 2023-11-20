import db from "../db.server";

export function createShopifyOrderCreatedUnhandled(shop: string, orderId: number, admin_graphql_api_id: string, current_total_price: string,  ){
    return db.shopifyOrderCreatedUnhandled.create({
        data: {
            orderId: orderId,
            shop: shop,
            admin_graphql_api_id,
            current_total_price,
        }
    })
}

export function getShopifyOrderCreatedUnhandled( ){
    const order = db.shopifyOrderCreatedUnhandled.findMany()
    return order
}
    
export async function removeFromOrderCreatedQueue(orderId: bigint){
    const order = await db.shopifyOrderCreatedUnhandled.findUnique({where:{orderId}})
    if(order == null){
        return false
    }

    const handledOrder = await db.shopifyOrderCreatedHandled.create({
        data: order
    })
    await db.shopifyOrderCreatedUnhandled.delete({where:{orderId}})

    return true
}
