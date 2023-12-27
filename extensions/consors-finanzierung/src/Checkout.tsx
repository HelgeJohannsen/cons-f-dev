import {
  Banner,
  BlockLayout,
  Button,
  Image,
  InlineLayout,
  Link,
  Text,
  TextField,
  View,
  reactExtension,
  useApi,
  useApplyMetafieldsChange,
  useBuyerJourneyIntercept,
  useCheckoutToken,
  useEmail,
  useExtensionCapability,
  useMetafield,
  useSelectedPaymentOptions,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";
import type { InterceptorRequest } from "@shopify/ui-extensions/checkout";
import {
  Metafield,
  MetafieldChangeResult,
  Money,
} from "@shopify/ui-extensions/checkout";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useCreateNewConsorsNotifyUUID } from "./hooks/useAppFetchJson";

import { useAppConfig } from "./hooks/useAppConfig";
import { useFetching } from "./hooks/useFetching";
import { useStringMetafield } from "./hooks/useStringMetafield";
import { backendUrl, createConsorsLink } from "./utils/consorsUrls";
import { checkProductTypeAktionszinsTag } from "./utils/helpers";

export default reactExtension(
  "purchase.checkout.payment-method-list.render-before",
  () => <Extension />
);
function buyerJourneyBlock(
  reason: string,
  message: string
): InterceptorRequest {
  return {
    behavior: "block",
    reason,
    errors: [{ message }],
  };
}

function Extension() {
  const { shop, cost, lines } = useApi();
  const appSettings = useAppConfig(shop.myshopifyDomain);
  const checkoutToken = useCheckoutToken();
  const mail = useEmail();
  const options = useSelectedPaymentOptions();
  const totalAmount = cost.totalAmount.current;
  const currencyIsSupported = totalAmount?.currencyCode == "EUR";

  const { countryCode, name, lastName } = useShippingAddress()!;
  const countryIsSupported = countryCode == "DE"; // || countryCode == "AT"
  // NOTE: Consors für Österreich nutzt einen anderen server (https://finanzieren.bnpparibas-pf.at/)
  //        siehe: https://marketingportal.consorsfinanz.de/finanzierung-in-oesterreich/eFinancing/inhalte#44c678a2
  //               Handbuch EFinancing (deutsche Version)
  //               Punkt 3.3 seite 15

  console.log("payment options", options);

  const createNewConsorsNotifyUUID = useCreateNewConsorsNotifyUUID();

  const [consorsUUID, setConsorsUUID] = useStringMetafield(
    "consors",
    "consorsUUID"
  );
  const [consorsStateMetafield, setConsorsStateMetafield] = useStringMetafield(
    "consors",
    "state"
  );
  const [consorsState, setConsorsState] = useState<string | undefined>(
    undefined
  );
  const [creditAmount, setCreditAmount] = useState<string | undefined>(
    undefined
  );
  const fetchState = useFetching(
    consorsUUID === undefined
      ? undefined
      : `${backendUrl()}/api/public/getstate/${consorsUUID}`
  );

  useEffect(() => {
    if (
      fetchState.data["state"] != undefined &&
      fetchState.data["state"] != "unknown" &&
      (fetchState.data["state"] !== consorsState ||
        fetchState.data["creditAmount"] !== creditAmount)
    ) {
      setConsorsStateMetafield(fetchState.data["state"]);
      setConsorsState(fetchState.data["state"]);
      setCreditAmount(fetchState.data["creditAmount"]);
    }
  }, [fetchState, consorsStateMetafield]);

  const [minBestellWert, setMinBestellWert] = useState(100);

  useEffect(() => {
    if (appSettings?.minBestellWert != undefined) {
      setMinBestellWert(appSettings.minBestellWert);
    }
  }, [setMinBestellWert, appSettings?.minBestellWert]);

  // TODO: min anpassen / anzeigen
  const mindestBestellwertErreicht = useMemo(() => {
    if (appSettings?.minBestellWert != undefined) {
      return totalAmount?.amount * 100 > appSettings?.minBestellWert;
    } else {
      return true;
    }
  }, [appSettings?.minBestellWert]);

  const financeOptionSelected = useMemo(() => {
    if (
      options.length == 1 &&
      options[0].type === "manualPayment" &&
      appSettings?.paymentHandle != undefined &&
      options[0].handle == appSettings.paymentHandle
    ) {
      return true;
    } else {
      console.log("handle:", options[0].handle);
      return false;
    }
  }, [options, options[0]?.handle, appSettings, appSettings?.paymentHandle]);

  const [uuidRequested, setUuidRequested] = useState(false); // so we onely request one uuid

  useEffect(() => {
    if (consorsUUID === undefined && financeOptionSelected && !uuidRequested) {
      setRequestUuid(true);
    }
  }, [consorsUUID, financeOptionSelected, uuidRequested]);

  const [requestUuid, setRequestUuid] = useState(false); // so we onely request one uuid
  useEffect(() => {
    if (requestUuid && !uuidRequested) {
      setUuidRequested(true);
      createNewConsorsNotifyUUID().then((uuid) => {
        return setConsorsUUID(uuid);
      });
    }
  }, [requestUuid]);

  const isEligibleForAkitionzins = useMemo(
    () => checkProductTypeAktionszinsTag(lines.current),
    [lines]
  );

  const consorsLink = useMemo(
    () =>
      createConsorsLink(
        isEligibleForAkitionzins,
        appSettings,
        checkoutToken,
        mail,
        name,
        lastName,
        totalAmount,
        shop.myshopifyDomain
      ),
    [
      isEligibleForAkitionzins,
      appSettings,
      checkoutToken,
      mail,
      name,
      lastName,
      totalAmount,
      shop.myshopifyDomain,
    ]
  );

  const creditAmountMissmatch = useMemo(
    () =>
      creditAmount != undefined &&
      totalAmount?.amount.toFixed(2) != creditAmount.replace(",", "."),
    [creditAmount, totalAmount?.amount]
  );

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (canBlockProgress && financeOptionSelected) {
      if (creditAmountMissmatch) {
        return buyerJourneyBlock(
          "consors process missmatch",
          "Der Warenkorbwert stimmt nicht mit ihrem Antrag bei Consors Finanz überein, bitte starten sie einen neuen Antrag"
        );
      } else if (consorsState == "DECLINED") {
        return buyerJourneyBlock(
          "consors process declined",
          "Ihr Antrag wurde von Consors Finanz abgelehnt, starten sie einen neuen Antrag"
        );
      } else if (
        consorsState == undefined ||
        consorsState == "started" ||
        consorsState == "CANCELED" ||
        consorsState == "TIMEOUT" ||
        consorsState == "BAD_REQUEST" ||
        consorsState == "INCOMPLETE"
      ) {
        return buyerJourneyBlock(
          "consors process not started",
          "Schließen sie die Consors Finanz Finanzierung ab"
        );
      }

      // TODO: Fehlerfälle mÜssen expliziert erwähnt werden
    }
    return {
      behavior: "allow",
    };
  });
  // TODO: ggf. bleibt consorsLink undefined ?
  //console.log("creditAmountMissmatch: ", creditAmountMissmatch)

  return financeOptionSelected ? (
    <BlockLayout rows={[60, "fill"]} spacing={"none"}>
      {consorsState != "proposal" ? (
        <InlineLayout
          columns={["45%", "50%"]}
          spacing={"base"}
          blockAlignment={"center"}
          inlineAlignment={"center"}
        >
          <Image source="https://cdn.shopify.com/s/files/1/0758/3137/8199/files/ConsorsFinanzLogo.png?v=1701077799" />
          <Button
            disabled={
              !currencyIsSupported ||
              !countryIsSupported ||
              !mindestBestellwertErreicht ||
              consorsLink == undefined
            }
            // onPress={startConsorsProcess}
            // onPress={() => {}}
            to={consorsLink}
          >
            Jetzt Finanzieren mit Consors Finanz
          </Button>
        </InlineLayout>
      ) : (
        <></>
      )}
      <View border="none" padding="none">
        <Banner title="Informationen zur Finanzierung mit Consors Finanz">
          {!currencyIsSupported ? (
            <Text>
              {" "}
              Die Währung {totalAmount.currencyCode} wird nicht unterstuetzt{" "}
            </Text>
          ) : !countryIsSupported ? (
            <Text>
              Finanzierung ist nur innerhalb Deutschlands oder Österreichs
              möglich
            </Text>
          ) : !mindestBestellwertErreicht ? (
            <Text>
              Der Mindesbestellwert von{" "}
              {(minBestellWert / 100).toFixed(2).replace(".", ",")}€ für diese
              Bezahlmethode ist noch nicht erreicht
            </Text>
          ) : consorsLink == undefined ? (
            <Text>Technische Probleme mit der Finanzierung</Text>
          ) : consorsState == "proposal" ? (
            <Text>Finanzierungsantrag erfolgreich bearbeitet</Text>
          ) : (
            <>
              {" "}
              <Link
                // onPress={startConsorsProcess}
                to={consorsLink}
                external={false}
              >
                Klicken sie hier
              </Link>
              <Text>
                {" "}
                oder auf den Button um einen Finanzierungsantrag zu stellen.{" "}
              </Text>{" "}
              {consorsState == "DECLINED" ? (
                <Text>
                  Ihre Finanzierung wurde seitens Consors Finanz abgelehnt,
                  stellen sie einen anderen Antrag oder wählen sie eine andere
                  Bezahlungsmethode
                </Text>
              ) : (
                <Text>
                  Nach Abschluss der Finanzierung kann es einen Moment dauern,
                  bis Consors uns benachrichtigt, haben sie ein wenig Geduld
                </Text>
              )}{" "}
            </>
          )}
        </Banner>
      </View>
    </BlockLayout>
  ) : (
    <></>
  );
}
