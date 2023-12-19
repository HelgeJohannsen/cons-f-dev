/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Banner,
  BlockLayout,
  Button,
  Image,
  InlineLayout,
  Link,
  Text,
  View,
  reactExtension,
  useApi,
  useBuyerJourneyIntercept,
  useEmail,
  useSelectedPaymentOptions,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";
import type { InterceptorRequest } from "@shopify/ui-extensions/checkout";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  backendUrl,
  useAppConfig,
  useCreateNewConsorsNotifyUUID,
} from "./hooks/useAppFetchJson";

import { useConsorsLink } from "./hooks/useConsorsLink";

import { useFetching } from "./hooks/useFetching";
import { useStringMetafield } from "./hooks/useStringMetafield";
import { checkPaymentMethodSelected } from "./utils/helpers";

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
  const { shop, cost } = useApi();
  const appSettings = useAppConfig();
  const paymentOptions = useSelectedPaymentOptions();

  const totalAmount = cost.totalAmount.current;
  const currencyIsSupported = totalAmount?.currencyCode == "EUR";
  const returntocheckoutURL = `https://${shop.myshopifyDomain}/checkout`;

  const { countryCode, name, lastName } = useShippingAddress()!;
  const countryIsSupported = countryCode == "DE"; // || countryCode == "AT"
  // NOTE: Consors für Österreich nutzt einen anderen server (https://finanzieren.bnpparibas-pf.at/)
  //        siehe: https://marketingportal.consorsfinanz.de/finanzierung-in-oesterreich/eFinancing/inhalte#44c678a2
  //               Handbuch EFinancing (deutsche Version)
  //               Punkt 3.3 seite 15

  const mail = useEmail();

  // CF = Consors Finanzieren
  const isCFPaymentSelected = useMemo(
    () =>
      checkPaymentMethodSelected({
        appSettings,
        paymentOptions: paymentOptions,
      }),
    [appSettings, paymentOptions]
  );

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
  console.log("fetchState", fetchState);

  useEffect(() => {
    console.log("first useEffect");
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
  }, [
    fetchState,
    consorsStateMetafield,
    consorsState,
    creditAmount,
    setConsorsStateMetafield,
  ]);

  const startConsorsProcess = useCallback(() => {
    if (consorsStateMetafield == undefined) {
      setConsorsStateMetafield("started");
    }
  }, []);

  const [minBestellWert, setMinBestellWert] = useState(100);

  useEffect(() => {
    console.log("second useEffect");
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

  const [uuidRequested, setUuidRequested] = useState(false); // so we only request one uuid

  useEffect(() => {
    console.log("third useEffect");
    if (consorsUUID === undefined && isCFPaymentSelected && !uuidRequested) {
      setRequestUuid(true);
    }
  }, [consorsUUID, isCFPaymentSelected, uuidRequested]);

  const [requestUuid, setRequestUuid] = useState(false); // so we only request one uuid
  useEffect(() => {
    console.log("forth useEffect");
    if (requestUuid && !uuidRequested) {
      setUuidRequested(true);
      createNewConsorsNotifyUUID().then((uuid) => {
        return setConsorsUUID(uuid);
      });
    }
  }, [requestUuid]);

  const consorsLink = useConsorsLink(
    appSettings,
    totalAmount,
    mail,
    name,
    lastName,
    consorsUUID,
    returntocheckoutURL
  );

  //  const ssel = useConsorsSSE(consorsUUID, setConsorsState)

  const creditAmountMissmatch = useMemo(
    () =>
      creditAmount != undefined &&
      totalAmount?.amount.toFixed(2) != creditAmount.replace(",", "."),
    [creditAmount, totalAmount?.amount]
  );

  // console.log();
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (canBlockProgress && isCFPaymentSelected) {
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

  console.log("creditAmountMissmatch: ", creditAmountMissmatch);

  const isButtonDisabled = useMemo(() => {
    const isDisabled =
      !currencyIsSupported ||
      !countryIsSupported ||
      !mindestBestellwertErreicht ||
      consorsLink == undefined;
    return isDisabled;
  }, [
    currencyIsSupported,
    countryIsSupported,
    mindestBestellwertErreicht,
    consorsLink,
  ]);

  return isCFPaymentSelected ? (
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
            onPress={startConsorsProcess}
            to={consorsLink}
            disabled={isButtonDisabled}
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
                onPress={startConsorsProcess}
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
