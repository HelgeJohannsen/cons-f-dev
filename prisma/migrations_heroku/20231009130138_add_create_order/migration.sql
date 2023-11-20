/*
  Warnings:

  - The primary key for the `ShopifyOrderCreatedUnhandled` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ShopifyOrderCreatedUnhandled" DROP CONSTRAINT "ShopifyOrderCreatedUnhandled_pkey",
ALTER COLUMN "orderId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "ShopifyOrderCreatedUnhandled_pkey" PRIMARY KEY ("orderId");
