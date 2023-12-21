import type { CartLine, PaymentOption } from "@shopify/ui-extensions/checkout";
import type { AppConfig } from "../hooks/useAppFetchJson";

interface CheckPaymentMethodSelected {
  paymentOptions: PaymentOption[];
  appSettings: AppConfig;
}

const checkPaymentMethodSelected = ({
  paymentOptions,
  appSettings,
}: CheckPaymentMethodSelected): boolean => {
  if (appSettings?.paymentHandle == "") {
    console.log("paymentOptions", paymentOptions);
  }
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

const checkProductTypeAktionszinsTag = (currentLines: CartLine[]): boolean => {
  const allProductsHasTag = currentLines.every(
    (current) => current.merchandise.product.productType === "aktionszins"
  );
  return allProductsHasTag;
};

export { checkPaymentMethodSelected, checkProductTypeAktionszinsTag };
