import {
  Banner,
  Link,
  Text,
  useApi,
  reactExtension,
  useEmail,
  useShippingAddress,
  useSelectedPaymentOptions,
  TextField,
  useExtensionCapability,
  useBuyerJourneyIntercept,
  useApplyMetafieldsChange,
  useMetafield,
  useCheckoutToken,
} from "@shopify/ui-extensions-react/checkout";
import {
  Money,
  Metafield,
  MetafieldChangeResult,
} from "@shopify/ui-extensions/checkout";
import { useCallback, useEffect, useState } from "react";

type AllowedNamespaces = "consors";
type AllowedMetaFields = "consorsUUID" | "state" | "used";

export function useStringMetafield<
  TNamespace extends AllowedNamespaces,
  TMetaFielName extends AllowedMetaFields
>(
  namespace: TNamespace,
  key: TMetaFielName
): [string, (newValue: string) => Promise<MetafieldChangeResult>] {
  const metafield = useMetafield({ namespace, key });
  const [metafieldState, setMetafieldState] =
    useState<(typeof metafield)["value"]>();
  const [metafieldWriteInProgress, setMetafieldWriteInProgress] =
    useState(false);

  useEffect(() => {
    if (metafield?.value === metafieldState) {
      return undefined;
    }
    setMetafieldState(metafield?.value);
    console.log(`got metafield ${namespace}.${key} = ${metafield?.value}`);
  }, [namespace, key, metafield?.value]);

  const applyMetafieldsChange = useApplyMetafieldsChange();

  const update = useCallback(
    (newValue: string) => {
      if (newValue === metafieldState || metafieldWriteInProgress) {
        return undefined;
      }
      setMetafieldWriteInProgress(true);
      console.log(`updated ${namespace}.${key} = `, newValue);
      setMetafieldState(newValue);
      if (newValue !== undefined) {
        return applyMetafieldsChange({
          namespace,
          key,
          value: newValue,
          type: "updateMetafield",
          valueType: "string",
        }).then((res) => {
          setMetafieldWriteInProgress(false);
          return res;
        });
      } else {
        return applyMetafieldsChange({
          namespace,
          key,
          type: "removeMetafield",
        }).then((res) => {
          setMetafieldWriteInProgress(false);
          return res;
        });
      }
    },
    [metafieldState, applyMetafieldsChange, namespace, key]
  );

  return [metafield?.value, update] as [
    string,
    (newValue: string) => Promise<MetafieldChangeResult>
  ];
}
