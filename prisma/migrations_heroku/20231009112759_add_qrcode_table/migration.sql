-- CreateTable
CREATE TABLE "ShopifyOrderCreatedUnhandled" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "admin_graphql_api_id" TEXT NOT NULL,
    "current_total_price" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopifyOrderCreatedUnhandled_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyOrderCreatedHandled" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "admin_graphql_api_id" TEXT NOT NULL,
    "current_total_price" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "handledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopifyOrderCreatedHandled_pkey" PRIMARY KEY ("id")
);
