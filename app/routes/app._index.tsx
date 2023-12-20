/* eslint-disable @typescript-eslint/no-unused-vars */
import { json } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import {
  Card,
  Checkbox,
  ChoiceList,
  EmptyState,
  HorizontalGrid,
  HorizontalStack,
  Icon,
  IndexTable,
  Layout,
  Page,
  Select,
  Tabs,
  Text,
  TextField,
  Thumbnail,
  Tooltip,
} from "@shopify/polaris";
import db from "../db.server";
import { authenticate } from "../shopify.server";

import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { getConsorsClient, resetConsorsClient } from "~/utils/consors/api";
import { addTags } from "~/utils/graphql/orderTags";
import { createConfig, getOrCreateConfig } from "../models/config.server";

type AktionszinsOptionsI = {
  label: string;
  value: string;
}[];

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const Settings = await getOrCreateConfig(session.shop);

  const consorsApi = await getConsorsClient(session.shop);
  const jwt = await consorsApi?.jwt();
  const consorsDataOk = jwt !== undefined;

  return {
    ...Settings,
    consorsDataOk,
  };
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const body = await request.formData();
  console.log(" minBestellWert:" + body.get("minBestellWert"));
  console.log(" id:" + body.get("vendorId"));
  const Config = await db.config.update({
    where: { shop },
    data: {
      username: body.get("apiUsername"),
      vendorId: body.get("vendorId"),
      clientId: body.get("clientId"),
      laufzeiten: body.get("laufzeiten"),
      zeroMonth: body.get("zeroMonth"),
      zinsSaetze: body.get("zinsSaetze"),
      aktionszins: Number(body.get("aktionszins")),
      aktionsZinsMonate: Number(body.get("aktionsZinsMonate")),
      minBestellWert: Number(body.get("minBestellWert")),
      shop: shop,
      hash: body.get("hash"),
      apiKey: body.get("apiKey"),
      passwort: body.get("passwort"),
      mode: body.get("mode"),
    },
  });

  resetConsorsClient(session.shop);
  return Config;
}

export default function Index() {
  const laoderData = useLoaderData<typeof loader>();
  console.log("INDEX ROUTE");
  const {
    id,
    username,
    vendorId,
    clientId,
    laufzeiten,
    zeroMonth,
    zinsSaetze,
    aktionszins,
    aktionsZinsMonate,
    minBestellWert,
    apiKey,
    shop,
    hash,
    passwort,
    mode,
    consorsDataOk,
  } = laoderData!; // TODO: might be undefined if server not reachable ?

  const errors = useActionData()?.errors || {};
  const [apiUsernameTextfield, setapiUsernameTextfield] = useState(username);
  const [vendorIdTextfield, setVendorIdTextfield] = useState(vendorId);
  const [clientIdTextfield, setClientIdTextfield] = useState(clientId);
  const [laufzeitenTextfield, setLaufzeitenTextfield] = useState(laufzeiten);
  const [zeroMonthTextfield, setZeroMonthTextfield] = useState(zeroMonth);
  const [zinsSaetzeTextfield, setzinsSaetzeTextfield] = useState(zinsSaetze);
  const [aktionszinsTextfield, setaktionszinsTextfield] = useState(
    aktionszins ?? 0
  );
  const [aktionsZinsMonateTextfield, setaktionsZinsMonateTextfield] = useState(
    aktionsZinsMonate ?? 0
  );
  const [minBestellwertTextfield, setminBestellwertTextfield] = useState(
    minBestellWert ?? 11000
  );
  const [hashTextfield, sethashTextfield] = useState(hash);
  const [passwortTextfield, setPasswortTextfield] = useState(passwort);
  const [apiKeyTextfield, setApiKeyTextfield] = useState(apiKey);
  const [modeDropDown, setModeDropDown] = useState(mode);

  const submit = useSubmit();

  function handleSave() {
    if (id === undefined) {
      console.error("could not load ID from server, cant submit without ID"); // TODO: better handeling
    } else {
      const data = {
        id: id,
        apiUsername: apiUsernameTextfield ?? null,
        vendorId: vendorIdTextfield ?? null,
        clientId: clientIdTextfield ?? null,
        laufzeiten: laufzeitenTextfield ?? null,
        zeroMonth: zeroMonthTextfield ?? null,
        zinsSaetze: zinsSaetzeTextfield ?? null,
        aktionszins: aktionszinsTextfield ?? null,
        aktionsZinsMonate: aktionsZinsMonateTextfield ?? null,
        minBestellWert: minBestellwertTextfield ?? null,
        shop: shop ?? null,
        passwort: passwortTextfield ?? null,
        apiKey: apiKeyTextfield ?? null,
        hash: hashTextfield ?? null,
        mode: modeDropDown ?? null,
      };

      submit(data, { method: "post" });
    }
  }
  useEffect(() => {
    handleSave();
  }, [modeDropDown]);
  const aktionszinsOptions: AktionszinsOptionsI = [
    { label: "0", value: "0" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
  ];

  return (
    <Page>
      <ui-title-bar title="Einstellungen"> </ui-title-bar>
      <Tabs tabs={[]} selected={0}></Tabs>
      <HorizontalGrid gap="4" columns={3}>
        <Card>
          <Text as="h2" variant="headingMd">
            Consors EFI
          </Text>
          <TextField
            id="title"
            label="API-Username"
            autoComplete="off"
            value={apiUsernameTextfield}
            onChange={(value) => setapiUsernameTextfield(value)}
            onBlur={() => handleSave()}
            error={errors.title}
          />
          <TextField
            id="title"
            label="VendorID"
            autoComplete="off"
            value={vendorIdTextfield}
            onChange={(value) => setVendorIdTextfield(value)}
            onBlur={() => handleSave()}
            error={errors.title}
          />
          <ChoiceList
            title="App Mode"
            name="appMode"
            allowMultiple={false}
            selected={[modeDropDown]}
            choices={[
              // {value: "demo", label: "Demo Mode"},
              { value: "live", label: "Live Betrieb" },
              { value: "off", label: "Abgeschaltet" },
            ]}
            onChange={(value) => {
              console.log(`onChange event with value: ${value}`);
              // TODO: can value be of another length then 1 ?
              if (value.length === 1) {
                setModeDropDown(value[0]);
              }
            }}
          />
        </Card>

        <Card>
          <Text as="h2" variant="headingMd">
            Konfigurator
          </Text>
          <Tooltip content="Mindestlaufzeit, Maximallaufzeit und Schritte">
            <TextField
              id="laufzeiten"
              label="Laufzeiten"
              autoComplete="off"
              value={laufzeitenTextfield}
              onChange={(value) => setLaufzeitenTextfield(value)}
              onBlur={() => handleSave()}
              error={errors.title}
            />
          </Tooltip>
          <TextField
            id="zeroMonth"
            label="Monate mit Nullprozentfinanzierung"
            autoComplete="off"
            value={zeroMonthTextfield}
            onChange={(value) => setZeroMonthTextfield(value)}
            onBlur={() => handleSave()}
            error={errors.title}
          />
          <TextField
            id="zinsSaetze"
            label="Zinssätze"
            autoComplete="off"
            value={zinsSaetzeTextfield}
            onChange={(value) => setzinsSaetzeTextfield(value)}
            onBlur={() => handleSave()}
            error={errors.title}
          />
          <Select
            id="aktionszins"
            label="Aktionszins"
            options={aktionszinsOptions}
            onChange={(value) => setaktionszinsTextfield(parseInt(value))}
            onBlur={() => handleSave()}
            value={aktionszinsTextfield.toString()}
            error={errors.title}
          />
          {aktionszinsTextfield !== 0 && (
            <TextField
              id="aktionszins"
              label="Aktionszins Monate"
              autoComplete="off"
              value={aktionsZinsMonateTextfield.toString()}
              onChange={(value) =>
                setaktionsZinsMonateTextfield(parseInt(value))
              }
              onBlur={() => handleSave()}
              error={errors.title}
            />
          )}
          <TextField
            id="minBestellwert"
            label="mindestBestellwert"
            autoComplete="off"
            value={minBestellwertTextfield.toString()}
            onChange={(value) => setminBestellwertTextfield(parseInt(value))}
            onBlur={() => handleSave()}
            error={errors.title}
          />
        </Card>
        <Card>
          <Text as="h2" variant="headingMd">
            Sicherheit
          </Text>
          <TextField
            id="passwort"
            label="Passwort"
            autoComplete="off"
            value={passwortTextfield}
            onChange={(value) => setPasswortTextfield(value)}
            onBlur={() => handleSave()}
            error={errors.title}
          />
          <TextField
            id="apiKey"
            label="ApiKey"
            autoComplete="off"
            value={apiKeyTextfield}
            onChange={(value) => setApiKeyTextfield(value)}
            onBlur={() => handleSave()}
            error={errors.title}
          />
          <TextField
            id="hash"
            label="Hash"
            autoComplete="off"
            value={hashTextfield}
            onChange={(value) => sethashTextfield(value)}
            onBlur={() => handleSave()}
            error={errors.title}
          />
          <Checkbox
            label={
              consorsDataOk
                ? "Consors Daten sind korrekt"
                : "Consors Daten sind nicht korrekt"
            }
            disabled={true}
            checked={consorsDataOk}
          />
        </Card>
      </HorizontalGrid>
    </Page>
  );
}
