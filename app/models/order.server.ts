import db from "../db.server";

export function getOrder(id) {
  const order = db.order.findFirst({ where: { id: Number(id) } });
  return order;
}

export async function createOrder(shop, orderId) {
  /** @type {any} */
  const data = {
    shop,
    orderId,
  };
  const order = await db.order.create({ data });
  if (!order) {
    return null;
  }
  return order;
}
