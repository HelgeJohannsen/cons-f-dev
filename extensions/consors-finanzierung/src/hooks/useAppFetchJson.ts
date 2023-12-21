import {
  useApi,
  useCheckoutToken,
} from "@shopify/ui-extensions-react/checkout";
import { useCallback, useEffect, useState } from "react";
import type { AppConfig } from "../types";
import { backendUrl } from "../utils/helpers";

export function useAppFetchJson() {
  const { shop } = useApi();

  // TODO: maybe use some sort of autentication
  return useCallback(
    (
      path: string,
      parameters: URLSearchParams,
      method: "GET" | "POST" = "GET"
    ) => {
      const targetUrl = `${backendUrl()}${path}?` + parameters;
      // console.log("fetching", targetUrl);
      return fetch(targetUrl, { method }) // TODO: error handeling
        .then(async (response) => {
          const text = await response.text();
          console.log(targetUrl, "yielded", text);
          return JSON.parse(text);
        })
        .catch((reson) => {
          console.error("something went wrong :)", reson);
        });
    },
    [shop.myshopifyDomain]
  );
}

export function useCreateNewConsorsNotifyUUID() {
  const { shop } = useApi();

  const appFetchJson = useAppFetchJson();
  const checkoutToken = useCheckoutToken();
  // TODO: Error handling
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
          console.error("could not load or create checkout:)", reason);
        }),
    [shop.myshopifyDomain, checkoutToken]
  );
}

// export function useAppConfig() {
//   const { shop } = useApi();

//   const appFetchJson = useAppFetchJson();

//   const [config, setConfig] = useState<undefined | AppConfig>(undefined);
//   const [shopDomain, setShopDomain] = useState<string>("");

//   useEffect(() => {
//     if (shopDomain != shop.myshopifyDomain) {
//       // console.log("config requested");
//       setShopDomain(shop.myshopifyDomain);
//       const reuestUrl = "/api/public/config";
//       const parameters = new URLSearchParams({
//         shop: shop.myshopifyDomain,
//       });
//       try {
//         appFetchJson(reuestUrl, parameters).then((c: AppConfig) => {
//           // console.log("config received", c);
//           setConfig(c);
//         });
//       } catch (reason) {
//         // console.log("error getting config", reason);
//       }
//     }
//   }, [shop.myshopifyDomain]);

//   return config as AppConfig | undefined;
// }
