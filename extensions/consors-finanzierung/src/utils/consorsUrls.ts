import type { Money } from "@shopify/ui-extensions/checkout";
import type { AppConfig } from "../types";

function backendUrl() {
  return "https://cons-f-dev.cpro-server.de";
}

function consorsNotifyUrl(checkoutToken: string) {
  return `${backendUrl()}/api/public/notify/${checkoutToken}`;
}

function createConsorsLink(
  isEligibleForAkitionzins: boolean,
  appSettings: AppConfig | undefined,
  checkoutToken: string,
  mail: string,
  name: string,
  lastName: string,
  totalAmount: Money,
  myshopifyDomain: string
): string | undefined {
  console.log("createConsorsLink renders");
  if (!appSettings) return undefined;
  const { vendorId, aktionszins, aktionsZinsMonate } = appSettings;
  const totalAmountAsString = `${totalAmount.amount}`.replace(".", ",");
  const returntocheckoutURL = `https://${myshopifyDomain}/checkout`;
  const notifyUrl = consorsNotifyUrl(checkoutToken);

  const defaultUrlParams = {
    vendorid: vendorId,
    order_amount: totalAmountAsString,
    email: mail,
    firstname: name,
    lastname: lastName,
    returntocheckoutURL: returntocheckoutURL,
    failureURL: returntocheckoutURL,
    cancelURL: returntocheckoutURL,
    notifyURL: notifyUrl,
  };

  const parameters = isEligibleForAkitionzins
    ? new URLSearchParams({
        ...defaultUrlParams,
        aktionszins: aktionszins.toString(),
        aktionsZinsMonate: aktionsZinsMonate.toString(),
      })
    : new URLSearchParams({
        ...defaultUrlParams,
      });

  return `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`;
}

export { backendUrl, consorsNotifyUrl, createConsorsLink };