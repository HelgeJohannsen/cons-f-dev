/*
  Warnings:

  - The primary key for the `ShopifyOrderCreatedHandled` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ShopifyOrderCreatedHandled` table. All the data in the column will be lost.
  - The primary key for the `ShopifyOrderCreatedUnhandled` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ShopifyOrderCreatedUnhandled` table. All the data in the column will be lost.
  - Added the required column `orderId` to the `ShopifyOrderCreatedHandled` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `ShopifyOrderCreatedUnhandled` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShopifyOrderCreatedHandled" DROP CONSTRAINT "ShopifyOrderCreatedHandled_pkey",
DROP COLUMN "id",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD CONSTRAINT "ShopifyOrderCreatedHandled_pkey" PRIMARY KEY ("orderId");

-- AlterTable
ALTER TABLE "ShopifyOrderCreatedUnhandled" DROP CONSTRAINT "ShopifyOrderCreatedUnhandled_pkey",
DROP COLUMN "id",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD CONSTRAINT "ShopifyOrderCreatedUnhandled_pkey" PRIMARY KEY ("orderId");
