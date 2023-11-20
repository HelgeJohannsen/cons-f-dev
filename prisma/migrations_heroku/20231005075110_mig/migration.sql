/*
  Warnings:

  - A unique constraint covering the columns `[shop]` on the table `Config` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aktionszins` to the `Config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiUsername` to the `Config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Config` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "aktionszins" INTEGER NOT NULL,
ADD COLUMN     "apiUsername" TEXT NOT NULL,
ADD COLUMN     "clientId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Config_shop_key" ON "Config"("shop");
