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
    
export function incrementCounterShopifyOrderCancelUnhandled( orderId: bigint ){
    return db.shopifyOrderCancelUnhandled.findUnique( {where:{orderId}} ).then(
        (order)=>{
            if(order != undefined){
                return db.shopifyOrderCancelUnhandled.update( {where:{orderId}, data:{counter: order.counter+1}} )
            }
        }
    )
}

export async function handleShopifyOrderCancel(orderId: bigint){
    const order = await db.shopifyOrderCancelUnhandled.findUnique({where:{orderId}})
    if(order == null){
        return false
    }

    await db.shopifyOrderCancelHandled.create({
        data: order
    }).then(() => db.shopifyOrderCancelUnhandled.delete({where:{orderId}}))
    return true
}
