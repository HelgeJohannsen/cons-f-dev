import { useEffect, useState } from "react";
import { backendUrl } from "../utils/consorsUrls";

type RequestData = {
  uuid: string;
};

export function useCheckoutTokenPersistence(
  myshopifyDomain: string,
  checkoutToken: string
): string {
  const [ct, setCt] = useState("");

  useEffect(() => {
    const getNotifyUrl = async () => {
      try {
        const apiEndpoint = `/api/public/checkouts/${encodeURIComponent(
          myshopifyDomain
        )}`;
        const parameters = new URLSearchParams({ checkoutToken });
        const requestUrl = `${backendUrl()}${apiEndpoint}?${parameters}`;

        const response = await fetch(requestUrl, { method: "POST" });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: RequestData = await response.json();
        setCt(data.uuid);
      } catch (error) {
        console.error("could not load or create checkout", error);
      }
    };
    getNotifyUrl();
  }, [checkoutToken, myshopifyDomain]);

  return ct;
}
