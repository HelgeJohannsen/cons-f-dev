import type { CartLine } from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";
import type { AppConfig } from "../types";
import { backendUrl } from "../utils/consorsUrls";

export const useCheckAktionszins = (
  currentLines: CartLine[],
  appSettings: AppConfig | undefined | null
) => {
  const [checkAktionszins, setCheckAktionszins] = useState(false);

  const checkoutProductsIds = currentLines.map((line) => {
    const productIdParts = line.merchandise.product.id.split("/");
    const id = productIdParts[productIdParts.length - 1];
    return id;
  });

  useEffect(() => {
    const getTestData = async () => {
      const areProductsAktionColletion = await Promise.all(
        checkoutProductsIds.map(async (productId) => {
          const apiEndpoint = `api/public/ProductAZ/${productId}`;
          const requestUrl = `${backendUrl()}/${apiEndpoint}`;
          const response = await fetch(requestUrl, { method: "GET" });
          const data: boolean = await response.json();
          return data;
        })
      );
      const checkProductsAktionColletion = areProductsAktionColletion.every(
        (data) => data
      );
      setCheckAktionszins(checkProductsAktionColletion);
    };
    getTestData();
  }, [checkoutProductsIds]);

  return !appSettings || !appSettings.aktionszins ? false : checkAktionszins;
};
