import type { CartLine } from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";
import { backendUrl } from "../utils/consorsUrls";

export const useCheckAktionszins = (
  currentLines: CartLine[],
  aktionszins: number | undefined | null
) => {
  const [isAktionszinsApplicable, setIsAktionszinsApplicable] = useState(false);

  useEffect(() => {
    if (!aktionszins || currentLines.length === 0) {
      setIsAktionszinsApplicable(false);
      return;
    }

    const checkAktionszinsForProducts = async () => {
      try {
        const productIds = currentLines.map((line) =>
          line.merchandise.product.id.split("/").pop()
        );

        const results = await Promise.all(
          productIds.map(async (productId) => {
            const response = await fetch(
              `${backendUrl()}/api/public/ProductAZ/${productId}`,
              { method: "GET" }
            );
            return response.json();
          })
        );

        setIsAktionszinsApplicable(results.every((result) => result));
      } catch (error) {
        console.error("Error checking aktionszins:", error);
        setIsAktionszinsApplicable(false);
      }
    };

    checkAktionszinsForProducts();
  }, [currentLines, aktionszins]);

  return isAktionszinsApplicable;
};
