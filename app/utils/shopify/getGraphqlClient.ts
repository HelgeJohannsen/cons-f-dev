import "@shopify/shopify-app-remix/adapters/node";
import {shopifyApi} from '@shopify/shopify-api';

import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";

import prisma from "../../db.server";

const appHostName = "cancellation-likelihood-expansys-reflect.trycloudflare.com"

const api = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "fe93e07b0e2bf2a7fe45cbacd0d3a907",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  hostName: appHostName,
  isEmbeddedApp: true,
})

export function getGraphqlClient(shop: string){
  // might throw an exception, if no session for the shop exists
  return prisma.session.findFirst({where:{shop}}).then(session => {
    if(session == null){
      throw "no session for given shop" // TODO: handle exception
    }
    return new api.clients.Graphql({session})  // TODO: convert types if neccessary
  })
}
