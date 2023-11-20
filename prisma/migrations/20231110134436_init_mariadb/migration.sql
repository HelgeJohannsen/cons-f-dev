-- CreateTable
CREATE TABLE `ShopifyOrderCreatedUnhandled` (
    `orderId` BIGINT NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `admin_graphql_api_id` VARCHAR(191) NOT NULL,
    `current_total_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyOrderCreatedHandled` (
    `orderId` BIGINT NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `admin_graphql_api_id` VARCHAR(191) NOT NULL,
    `current_total_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `handledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyOrderCancelUnhandled` (
    `orderId` BIGINT NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `admin_graphql_api_id` VARCHAR(191) NOT NULL,
    `current_total_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyOrderCancelHandled` (
    `orderId` BIGINT NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `admin_graphql_api_id` VARCHAR(191) NOT NULL,
    `current_total_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `handledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyOrderFulfillmentUnhandled` (
    `orderId` BIGINT NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `admin_graphql_api_id` VARCHAR(191) NOT NULL,
    `current_total_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyOrderFulfillmentHandled` (
    `orderId` BIGINT NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `admin_graphql_api_id` VARCHAR(191) NOT NULL,
    `current_total_price` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `handledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Checkout` (
    `uuid` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NULL,
    `orderId` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckoutState` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkoutId` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `notifyRequest` VARCHAR(191) NOT NULL,
    `creditAmount` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `apiUsername` VARCHAR(191) NOT NULL,
    `verndorId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `laufzeiten` VARCHAR(191) NOT NULL,
    `zeroMonth` VARCHAR(191) NOT NULL,
    `zinsSaetze` VARCHAR(191) NOT NULL,
    `aktionszins` INTEGER NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `passwort` VARCHAR(191) NOT NULL,
    `paymentHandle` VARCHAR(191) NOT NULL,
    `minBestellWert` INTEGER NOT NULL DEFAULT 11000,

    UNIQUE INDEX `Config_shop_key`(`shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CheckoutState` ADD CONSTRAINT `CheckoutState_checkoutId_fkey` FOREIGN KEY (`checkoutId`) REFERENCES `Checkout`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
