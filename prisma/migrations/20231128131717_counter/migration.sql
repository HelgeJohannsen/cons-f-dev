/*
  Warnings:

  - Added the required column `counter` to the `ShopifyOrderCancelHandled` table without a default value. This is not possible if the table is not empty.
  - Added the required column `counter` to the `ShopifyOrderCreatedHandled` table without a default value. This is not possible if the table is not empty.
  - Added the required column `counter` to the `ShopifyOrderFulfillmentHandled` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ShopifyOrderCancelHandled` ADD COLUMN `counter` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ShopifyOrderCreatedHandled` ADD COLUMN `counter` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ShopifyOrderFulfillmentHandled` ADD COLUMN `counter` INTEGER NOT NULL;
