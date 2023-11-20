
import { z } from "zod"

import {createHmac} from "node:crypto"

export const consorsNotification = z.object({
  status: z.enum(["error", "success", "proposal", "accepted","error_cancelled","error_declined"]),
  status_detail: z.enum(["CANCELLED", "TIMEOUT", "DECLINED", "BAD_REQUEST", "INCOMPLETE"]).optional(),
  order_id: z.string().optional(),
  transaction_id: z.string().optional(),
  duration: z.coerce.number().optional(),
  campain: z.string().optional(),
  creditAmount: z.coerce.number().optional(),
  vendorId: z.string(),
  hash: z.string().optional(),
})
export type ConsorsNotification = z.infer<typeof consorsNotification>


function calculateHmacSha512(message: string,key: string){
  return createHmac('sha512', Buffer.from(key))
    .update(message)
    .digest('hex')
}

const hashKey = "12345678910" as const

export function checkNotifyHash(url:string){
  const parts = url.split("&hash=",2)
  if(parts.length != 2){
    //hash not contained in url
    //console.error("no consors notify hash found in url: ", url)
    return false
  }
  const [urlWithoutHash, providedHash] = parts
  const calculatedHash  = calculateHmacSha512(urlWithoutHash, hashKey)

  const valideNotify = calculatedHash.toLowerCase() === providedHash.toLowerCase()

  // if(!valideNotify){
  //   console.error("consors notify hash is incorrect for url: ", url)
  // }

  return valideNotify
}

