import type { CartLine, PaymentOption } from "@shopify/ui-extensions/checkout";
import type { AppConfig } from "../types";

interface CheckPaymentMethodSelected {
  paymentOptions: PaymentOption[];
  appSettings: AppConfig;
}

const checkPaymentMethodSelected = ({
  paymentOptions,
  appSettings,
}: CheckPaymentMethodSelected): boolean => {
  if (appSettings?.paymentHandle == "") {
    // console.log("paymentOptions", paymentOptions);
  }
  if (
    paymentOptions.length == 1 &&
    paymentOptions[0].type === "manualPayment" &&
    appSettings?.paymentHandle != undefined &&
    paymentOptions[0].handle == appSettings.paymentHandle
  ) {
    return true;
  } else {
    // console.log("handle checkPaymentMethodSelected:", paymentOptions[0].handle);
    return false;
  }
};

const checkProductTypeAktionszinsTag = (currentLines: CartLine[]): boolean => {
  const allProductsHasTag = currentLines.every(
    (current) => current.merchandise.product.productType === "aktionszins"
  );
  return allProductsHasTag;
};

function backendUrl() {
  return "https://cons-f-dev.cpro-server.de";
}

function consorsNotifyUrl(uuid: string) {
  return `${backendUrl()}/api/public/notify/${uuid}`;
}

export {
  backendUrl,
  checkPaymentMethodSelected,
  checkProductTypeAktionszinsTag,
  consorsNotifyUrl,
};
