import { useEffect, useState } from "react";
import type { AppConfig } from "../types";
import { backendUrl } from "../utils/helpers";

export function useAppConfig(myshopifyDomain: string) {
  const [appSettings, setAppSettings] = useState<AppConfig | null>(null);

  useEffect(() => {
    const getAppConfig = async () => {
      try {
        console.log("useAppConfig custom hook");
        const requestUrl = "/api/public/config";
        const parameters = new URLSearchParams({ shop: myshopifyDomain });
        const targetUrl = `${backendUrl()}${requestUrl}?${parameters}`;

        const response = await fetch(targetUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAppSettings(data);
      } catch (error) {
        console.error("Error fetching AppConfig:", error);
      }
    };
    getAppConfig();
  }, [myshopifyDomain]);

  return appSettings;
}
