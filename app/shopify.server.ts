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

import prisma from "./db.server";
import { getShopifyOrderCreatedUnhandled, removeFromOrderCreatedQueue } from "./models/ShopifyOrderCreated.server";
import { handleOrderQueue } from "./utils/shopify/webhooks/ordersCreate";
import { getShopifyOrderCancelUnhandled, handleShopifyOrderCancel } from "./models/ShopifyOrderCancel.server";
import { handleOrderCancelQueue } from "./utils/shopify/webhooks/ordersCancel";
import { getShopifyOrderFulfillmentUnhandled, removeFromOrderFulfillmentQueue } from "./models/ShopifyOrderFulfillment.server";
import { handleFulfillmentQueue } from "./utils/shopify/webhooks/ordersFulfillment";
/*
const api = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "fe93e07b0e2bf2a7fe45cbacd0d3a907",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  hostName: "",
  isEmbeddedApp: true,
})
*/
async function BackgroundLoop(){
  console.log("Background Loop")
  const unhandledOrder = await getShopifyOrderCreatedUnhandled()
  const toHandle = unhandledOrder.map( async unhandledOrder => {
    console.log("unhandledOrder", unhandledOrder)
    // TODO: handle Order
    await handleOrderQueue(unhandledOrder)
      .then( (sucess) => {
          if(sucess){
            removeFromOrderCreatedQueue(unhandledOrder.orderId)
          }
        }
      )
      .catch( (reason) => console.error("Error handleShopifyOrderCreated:", reason)) //TODO: handle Error using backoff timer
  })
  await Promise.all(toHandle)

  const unhandledOrderCancel = await getShopifyOrderCancelUnhandled()
  const toHandleCancel = unhandledOrderCancel.map( async unhandledOrderCancel => {
    console.log("unhandledOrderCancel", unhandledOrderCancel)
    // TODO: handle Order
    
    await handleOrderCancelQueue(unhandledOrderCancel)
    .then( (sucess) => {
      if(sucess){
        handleShopifyOrderCancel(unhandledOrderCancel.orderId)
      }
    }
    ).catch( (reason) => console.error("Error handleShopifyOrderCancel:", reason)) //TODO: handle Error using backoff timer
  })
  await Promise.all(toHandleCancel)

  const unhandledOrderFulfillment = await getShopifyOrderFulfillmentUnhandled()
  const toHandleFulfillment = unhandledOrderFulfillment.map( async unhandledOrderFulfillment => {
    console.log("unhandledFulfillment", unhandledOrderFulfillment)
    await handleFulfillmentQueue(unhandledOrderFulfillment)
    .then( (sucess) => {
      if(sucess){
        removeFromOrderFulfillmentQueue(unhandledOrderFulfillment.orderId)
      }
    }
    ).catch( (reason) => console.error("Error unhandledOrderFulfillment:", reason)) //TODO: handle Error using backoff timer
  })
  await Promise.all(toHandleFulfillment)

  setTimeout(() => BackgroundLoop(), 30e3)
}



BackgroundLoop()

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "fe93e07b0e2bf2a7fe45cbacd0d3a907",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      format: JSON, 
    },
    ORDERS_FULFILLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      format: JSON, 
    },
    ORDERS_CANCELLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      format: JSON, 
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
