import db from "../db.server";

export async function getCheckout(uuid: string) {
  const checkout = await db.checkout.findUnique({ where: { uuid } });
  if(!checkout){
    console.log("kein checkout uuid",checkout)
    const orderId = BigInt(uuid)
    const checkoutOrderID = await db.checkout.findFirst({ where: { orderId } });
    if(checkoutOrderID){
      console.log("checkout mit orderID gefunden",checkoutOrderID)
      return checkoutOrderID
    }
  }else{
    console.log("checkout mit uuid gefunden",checkout)
    return checkout
  }

}
export function getCheckoutByTransactionId(transaction_id: string) {
  return db.checkout.findFirst({ where: { transaction_id } });
}
export function getCheckoutByOrderId(orderId: bigint) {
  return db.checkout.findFirst({ where: { orderId } });
}
export function setOrderId(uuid: string, orderId: number) {
  // console.log(` --> setOrderId(uuid:${uuid}, orderId:${orderId})`);
  return db.checkout.update({ where: { uuid }, data: { orderId } });
}
export function setOrderIdAndName(uuid: string, orderId: number, orderName: string) {
  // console.log(` --> setOrderId(uuid:${uuid}, orderId:${orderId})`);
  return db.checkout.update({ where: { uuid }, data: { orderId, orderName } });
}
export function getCheckoutState(
  checkout: Pick<NonNullable<Awaited<ReturnType<typeof getCheckout>>>, "uuid">
) {
  return db.checkoutState.findMany({
    where: { checkoutId: checkout.uuid },
    orderBy: { createdAt: "desc" },
  });
}

export function createCheckoutState(
  checkout: Pick<NonNullable<Awaited<ReturnType<typeof getCheckout>>>, "uuid">,
  state: string,
  notifyRequest: string,
  creditAmount: number | undefined
) {
  return db.checkoutState.create({
    data: {
      checkoutId: checkout.uuid,
      state,
      notifyRequest,
      creditAmount:
        creditAmount == undefined ? undefined : creditAmount?.toFixed(2),
    },
  });
}
export async function createCheckoutByOrderID(shop: string, checkoutToken: string, orderId: number) {
  return db.checkout.create({ data: { uuid: checkoutToken, shop, orderId } })
}
export async function createCheckoutByOrderIDAndName(shop: string, checkoutToken: string, orderId: number, orderName: string) {
  return db.checkout.create({ data: { uuid: checkoutToken, shop, orderId, orderName } })
}
export async function getOrCreateCheckout(shop: string, checkoutToken: string) {
  //const res = await getCheckout(checkoutToken)
  //if(res == null){
  //  console.log("creating new checkout with uuid", checkoutToken)
  //  return db.checkout.create({data:{uuid: checkoutToken, shop}})// ({data});
  //}else{
  //  return res
  //}
  return db.checkout
    .create({ data: { uuid: checkoutToken, shop } })
    .catch(() => getCheckout(checkoutToken));
}

export async function checkoutDebug() {
  const all = await db.checkout.findMany();
  all.forEach((checkout) => {
    // console.log(checkout);
  });
}

export function checkoutAddTransactionId(uuid: string, transaction_id: string) {
  return db.checkout.update({ data: { transaction_id }, where: { uuid } });
}
export function setOrderName(orderId: number, orderName: string) {
  console.log(` --> setOrderId(orderId:${orderId}, orderName:${orderName})`);
  return db.checkout.update({ where: { orderId }, data: { orderName } });
}