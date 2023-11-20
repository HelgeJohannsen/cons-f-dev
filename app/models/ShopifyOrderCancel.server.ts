import db from "../db.server";

export function createShopifyOrderCancelUnhandled(shop: string, orderId: number, admin_graphql_api_id: string, current_total_price: string ){
    return db.shopifyOrderCancelUnhandled.create({
        data: {
            orderId: orderId,
            shop: shop,
            admin_graphql_api_id,
            current_total_price,
        }
    })
}

export function getShopifyOrderCancelUnhandled( ){
    const order = db.shopifyOrderCancelUnhandled.findMany()
    return order
}
    
export async function handleShopifyOrderCancel(orderId: bigint){
    const order = await db.shopifyOrderCancelUnhandled.findUnique({where:{orderId}})
    if(order == null){
        return false
    }

    const handledOrder = await db.shopifyOrderCancelHandled.create({
        data: order
    })
    await db.shopifyOrderCancelUnhandled.delete({where:{orderId}})

    return true
}
