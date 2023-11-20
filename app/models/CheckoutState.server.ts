import db from "../db.server";

import { randomUUID } from "crypto"

export function getCheckoutState(uuid: string) {
  return db.checkout.findUnique({  where: { uuid } });
}

export function createCheckout(shop: string) {
  const uuid=randomUUID()
  console.log("creating new checkout with uuid", uuid)
  return db.checkout.create({data:{uuid,shop}})// ({data});
}