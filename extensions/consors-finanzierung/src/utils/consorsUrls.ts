import type { Money } from "@shopify/ui-extensions/checkout";
import type { AppConfig } from "../types";

function backendUrl() {
  return "https://cons-f-dev.cpro-server.de";
}

function consorsNotifyUrl(checkoutToken: string) {
  return `${backendUrl()}/api/public/notify/${checkoutToken}`;
}

function returnToCheckoutUrl(shopDomain: string) {
  return `https://${shopDomain}/checkout`;
}

function createConsorsLink(
  isEligibleForAktionzins: boolean,
  appSettings: AppConfig | undefined,
  checkoutToken: string,
  mail: string,
  name: string,
  lastName: string,
  totalAmount: Money,
  myshopifyDomain: string
): string | undefined {
  if (!appSettings) return undefined;
  const { vendorId, aktionszins, aktionsZinsMonate } = appSettings;
  const totalAmountAsString = `${totalAmount.amount}`.replace(".", ",");
  const returntocheckoutURL = returnToCheckoutUrl(myshopifyDomain);
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

  const parameters = isEligibleForAktionzins
    ? new URLSearchParams({
        ...defaultUrlParams,
        campaign: aktionszins.toString(),
        campaignduration: aktionsZinsMonate.toString(),
      })
    : new URLSearchParams({
        ...defaultUrlParams,
      });

  return `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`;
}

export { backendUrl, consorsNotifyUrl, createConsorsLink, returnToCheckoutUrl };
