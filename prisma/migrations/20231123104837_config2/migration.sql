-- AlterTable
ALTER TABLE `CheckoutState` MODIFY `notifyRequest` MEDIUMTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Config` ADD COLUMN `aktionsZinsMonate` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `mode` ENUM('demo', 'live', 'off') NOT NULL DEFAULT 'off';

-- AlterTable
ALTER TABLE `ShopifyOrderCancelUnhandled` ADD COLUMN `counter` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ShopifyOrderCreatedUnhandled` ADD COLUMN `counter` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ShopifyOrderFulfillmentUnhandled` ADD COLUMN `counter` INTEGER NOT NULL DEFAULT 0;
