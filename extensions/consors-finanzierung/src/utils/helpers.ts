import type { CartLine, PaymentOption } from "@shopify/ui-extensions/checkout";
import type { AppConfig } from "../types";

const checkPaymentMethodSelected = (
  paymentOptions: PaymentOption[],
  appSettings: AppConfig
): boolean => {
  if (
    paymentOptions.length == 1 &&
    paymentOptions[0].type === "manualPayment" &&
    appSettings?.paymentHandle != undefined &&
    paymentOptions[0].handle == appSettings.paymentHandle
  ) {
    return true;
  } else {
    console.log("handle:", paymentOptions[0].handle);
    return false;
  }
};

const checkProductTypeAktionszinsTag = (
  currentLines: CartLine[],
  appSettings: AppConfig
): boolean => {
  if (!appSettings?.aktionszins) return false;
  const allProductsHasTag = currentLines.every(
    (current) => current.merchandise.product.productType === "aktionszins"
  );
  return allProductsHasTag;
};

export { checkPaymentMethodSelected, checkProductTypeAktionszinsTag };
