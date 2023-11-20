/*
  Warnings:

  - The `orderId` column on the `Checkout` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "orderId",
ADD COLUMN     "orderId" BIGINT;
