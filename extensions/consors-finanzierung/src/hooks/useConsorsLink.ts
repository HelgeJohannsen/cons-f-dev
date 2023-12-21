import {
  useApi,
  useCheckoutToken,
  useEmail,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";

import type { AppConfig } from "../types";
import { consorsNotifyUrl } from "../utils/helpers";

export function useConsorsLink(
  isEligibleForAkitionzins: boolean,
  appSettings: AppConfig
): string {
  const {
    cost: { totalAmount },
    shop: { myshopifyDomain },
  } = useApi();
  // console.log("useConsorsLink rendered");
  const mail = useEmail();
  const { name, lastName } = useShippingAddress();
  const returntocheckoutURL = `https://${myshopifyDomain}/checkout`;
  const checkoutToken = useCheckoutToken();
  const notifyUrl = consorsNotifyUrl(checkoutToken);

  if (appSettings == undefined) {
    return undefined; // APP settings not yet loaded
  }

  const defaultUrlParams = {
    vendorid: appSettings.vendorId,
    order_amount: `${totalAmount.current.amount}`.replace(".", ","),
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
        aktionszins: appSettings.aktionszins.toString(),
        aktionsZinsMonate: appSettings.aktionsZinsMonate.toString(),
      })
    : new URLSearchParams({
        ...defaultUrlParams,
      });

  const consorsUrl = `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`;

  return consorsUrl;
}
