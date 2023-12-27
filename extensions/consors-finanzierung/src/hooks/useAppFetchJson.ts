import {
  useApi,
  useCheckoutToken,
} from "@shopify/ui-extensions-react/checkout";
import { useCallback } from "react";
import { backendUrl } from "../utils/consorsUrls";

export function useAppFetchJson() {
  const { shop } = useApi();
  console.log("useAppFetchJson renders");

  // TODO: maybe use some sort of autentication

  return async (
    path: string,
    parameters: URLSearchParams,
    method: "GET" | "POST" = "GET"
  ) => {
    const targetUrl = `${backendUrl()}${path}?` + parameters;
    console.log("fetching", targetUrl);

    try {
      const response = await fetch(targetUrl, { method });
      console.log("response useAppFetchJson", response);

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      const dataInText = await response.text();
      console.log(targetUrl, "yielded", dataInText);
      return JSON.parse(dataInText);
    } catch (error) {
      console.error("Something went wrong", error);
    }
  };
}

export function useCreateNewConsorsNotifyUUID() {
  const { shop } = useApi();
  console.log("useCreateNewConsorsNotifyUUID renders");

  const appFetchJson = useAppFetchJson();
  const checkoutToken = useCheckoutToken();
  return useCallback(
    () =>
      appFetchJson(
        `/api/public/checkouts/${encodeURIComponent(shop.myshopifyDomain)}`,
        new URLSearchParams({ checkoutToken }),
        "POST"
      )
        .then((jsonReponse) => {
          console.log("new UUID Response:", jsonReponse);
          return jsonReponse.uuid;
        })
        .catch((reason) => {
          console.error("could not load or create checkout", reason);
        }),
    [shop.myshopifyDomain, checkoutToken, appFetchJson]
  );
}
