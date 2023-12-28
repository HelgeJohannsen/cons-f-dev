import { useEffect, useState } from "react";
import type { AppConfig } from "../types";
import { backendUrl } from "../utils/consorsUrls";

export function useAppConfig(myshopifyDomain: string): AppConfig | null {
  const [appSettings, setAppSettings] = useState<AppConfig | null>(null);

  useEffect(() => {
    const getAppConfig = async () => {
      try {
        const apiEndpoint = "/api/public/config";
        const parameters = new URLSearchParams({ shop: myshopifyDomain });
        const requestUrl = `${backendUrl()}${apiEndpoint}?${parameters}`;

        const response = await fetch(requestUrl, { method: "GET" });
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
