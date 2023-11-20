-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkout" (
    "uuid" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "transaction_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "CheckoutState" (
    "id" SERIAL NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "notifyRequest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "verndorId" TEXT NOT NULL,
    "laufzeiten" TEXT NOT NULL,
    "zeroMonth" TEXT NOT NULL,
    "zinsSaetze" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "passwort" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CheckoutState" ADD CONSTRAINT "CheckoutState_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
