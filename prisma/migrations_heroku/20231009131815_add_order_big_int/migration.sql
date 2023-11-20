/*
  Warnings:

  - The primary key for the `ShopifyOrderCreatedHandled` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ShopifyOrderCreatedHandled" DROP CONSTRAINT "ShopifyOrderCreatedHandled_pkey",
ALTER COLUMN "orderId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "ShopifyOrderCreatedHandled_pkey" PRIMARY KEY ("orderId");
