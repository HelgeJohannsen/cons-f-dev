import type { Money } from "@shopify/ui-extensions/checkout";
import { useMemo } from "react";
import type { AppConfig } from "./useAppFetchJson";
import { consorsNotifyUrl } from "./useAppFetchJson";

export function useConsorsLink2(
  appSettings: AppConfig | undefined,
  totalAmount: Money,
  mail: string,
  name: string,
  lastName: string,
  consorsUUID: string | undefined,
  returntocheckoutURL: string
) {
  const consorsLink: string | undefined = useMemo(() => {
    if (appSettings == undefined || consorsUUID == undefined) {
      return undefined; // APP settings not yet loaded, vendor id is unknown, link is
    }

    const notifyUrl = consorsNotifyUrl(consorsUUID); // Zum Testen andere URL als die Backendurl
    //const notifyUrl = `https://cons-6a9dc71762e0.herokuapp.com/api/public/notify/${consorsUUID.value}`
    console.log("notifyUrl", notifyUrl);
    // TODO: notify URL für den link nutzen

    const textAmount = `${totalAmount.amount}`.replace(".", ",");

    const parameters = new URLSearchParams({
      vendorid: appSettings.vendorId,
      order_amount: textAmount,
      email: mail,
      firstname: name,
      lastname: lastName,
      returntocheckoutURL: returntocheckoutURL,
      failureURL: returntocheckoutURL,
      cancelURL: returntocheckoutURL,
      notifyURL: notifyUrl,
    });
    return `https://finanzieren.consorsfinanz.de/web/ecommerce/gewuenschte-rate?${parameters}`;
  }, [
    appSettings,
    totalAmount,
    mail,
    name,
    lastName,
    consorsUUID,
    returntocheckoutURL,
  ]);

  return consorsLink;
}
