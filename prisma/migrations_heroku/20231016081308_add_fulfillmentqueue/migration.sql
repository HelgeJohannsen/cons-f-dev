-- CreateTable
CREATE TABLE "ShopifyOrderFulfillmentUnhandled" (
    "orderId" BIGINT NOT NULL,
    "shop" TEXT NOT NULL,
    "admin_graphql_api_id" TEXT NOT NULL,
    "current_total_price" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopifyOrderFulfillmentUnhandled_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "ShopifyOrderFulfillmentHandled" (
    "orderId" BIGINT NOT NULL,
    "shop" TEXT NOT NULL,
    "admin_graphql_api_id" TEXT NOT NULL,
    "current_total_price" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "handledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopifyOrderFulfillmentHandled_pkey" PRIMARY KEY ("orderId")
);
