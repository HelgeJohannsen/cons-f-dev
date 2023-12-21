import { useEffect, useState } from "react";
import { backendUrl } from "../utils/helpers";

export function useConsorsNotifyUUID(
  myshopifyDomain: string,
  checkoutToken: string
) {
  const [notifyUrl, setNotifyUrl] = useState();

  useEffect(() => {
    const getNotifyUrl = async () => {
      try {
        console.log("notifyUrl custom hook");
        const requestUrl = `/api/public/checkouts/${encodeURIComponent(
          myshopifyDomain
        )}`;
        const parameters = new URLSearchParams({ shop: myshopifyDomain });
        const targetUrl = `${backendUrl()}${requestUrl}?${parameters}`;
        const response = await fetch(targetUrl, { method: "POST" });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("notifyUrl", data);
        setNotifyUrl(data);
      } catch (error) {
        console.error("Error fetching notification url", error);
      }
    };

    getNotifyUrl();
  }, [myshopifyDomain, checkoutToken]);

  return notifyUrl;
}
