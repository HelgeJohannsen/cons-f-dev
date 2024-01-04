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
  useCheckoutToken,
  useEmail,
  useSelectedPaymentOptions,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";
import type { InterceptorRequest } from "@shopify/ui-extensions/checkout";

import { useEffect, useMemo, useState } from "react";

import { useAppConfig } from "./hooks/useAppConfig";
import { useCheckAktionszins } from "./hooks/useCheckAktionszins";
import { useCheckoutTokenPersistence } from "./hooks/useCheckoutTokenPersistence";
import { useFetching } from "./hooks/useFetching";
import { backendUrl, createConsorsLink } from "./utils/consorsUrls";
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
  const [minBestellWert, setMinBestellWert] = useState(100);

  const { shop, cost, lines } = useApi();
  const appSettings = useAppConfig(shop.myshopifyDomain);
  const checkoutToken = useCheckoutToken();
  const mail = useEmail();
  const paymentOptions = useSelectedPaymentOptions();
  const totalAmount = cost.totalAmount.current;
  const currencyIsSupported = totalAmount?.currencyCode == "EUR";

  const isEligibleForAktionzins = useCheckAktionszins(
    lines.current,
    appSettings?.aktionszins
  );

  const { countryCode, name, lastName } = useShippingAddress()!;
  const countryIsSupported = countryCode == "DE"; // || countryCode == "AT"
  // NOTE: Consors für Österreich nutzt einen anderen server (https://finanzieren.bnpparibas-pf.at/)
  // siehe: https://marketingportal.consorsfinanz.de/finanzierung-in-oesterreich/eFinancing/inhalte#44c678a2
  // Handbuch EFinancing (deutsche Version)
  // Punkt 3.3 seite 15

  const financeOptionSelected = useMemo(
    () => checkPaymentMethodSelected(paymentOptions, appSettings),
    [paymentOptions, appSettings]
  );

  const consorsLink = useMemo(
    () =>
      createConsorsLink(
        isEligibleForAktionzins,
        appSettings,
        checkoutToken,
        mail,
        name,
        lastName,
        totalAmount,
        shop.myshopifyDomain
      ),
    [
      isEligibleForAktionzins,
      appSettings,
      checkoutToken,
      mail,
      name,
      lastName,
      totalAmount,
      shop.myshopifyDomain,
    ]
  );

  const ctHash = useCheckoutTokenPersistence(
    shop.myshopifyDomain,
    checkoutToken
  );

  const [consorsState, setConsorsState] = useState<string | undefined>(
    undefined
  );
  const [creditAmount, setCreditAmount] = useState<string | undefined>(
    undefined
  );
  const fetchState = useFetching(
    financeOptionSelected && ctHash
      ? `${backendUrl()}/api/public/getstate/${checkoutToken}`
      : undefined
  );

  useEffect(() => {
    if (
      fetchState.data["state"] != undefined &&
      fetchState.data["state"] != "unknown" &&
      (fetchState.data["state"] !== consorsState ||
        fetchState.data["creditAmount"] !== creditAmount)
    ) {
      setConsorsState(fetchState.data["state"]);
      setCreditAmount(fetchState.data["creditAmount"]);
    }
  }, [fetchState]);

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
