import { json } from "@remix-run/node";
import db from "../db.server";
import { useLoaderData, Link, useNavigate, useActionData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  HorizontalStack,
  Tooltip,
  TextField,
  HorizontalGrid,
  Tabs,
} from "@shopify/polaris";

import { createConfig, getOrCreateConfig } from "../models/config.server";
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import { useState } from "react";
import { addTags } from "~/utils/graphql/orderTags";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const Settings = await getOrCreateConfig(session.shop);
  
  return Settings;
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const body = await request.formData();
  console.log(" minBestellWert:" + body.get("minBestellWert"))
  console.log(" id:" + body.get("vendorId"))
  const Config = await db.config.update({
    where: { shop }, 
    data:{
      username: body.get("apiUsername"), 
      vendorId:   body.get("vendorId"),
      clientId:    body.get("clientId"),
      laufzeiten:  body.get("laufzeiten"),
      zeroMonth:   body.get("zeroMonth"),
      zinsSaetze:  body.get("zinsSaetze"), 
      aktionszins: Number(body.get("aktionszins")), 
      minBestellWert: Number(body.get("minBestellWert")),  
      shop:shop,
      hash:        body.get("hash"),
      apiKey:      body.get("apiKey"),
      passwort:    body.get("passwort")
    }
  });

  return Config;
}


export default function Index() {
  const { id, username,vendorId: vendorId,clientId,laufzeiten,zeroMonth,zinsSaetze, aktionszins, minBestellWert, apiKey, shop, hash, passwort } = useLoaderData();
  const errors = useActionData()?.errors || {};
  const [apiUsernameTextfield, setapiUsernameTextfield] = useState(username);
  const [vendorIdTextfield, setVendorIdTextfield] = useState(vendorId);
  const [clientIdTextfield, setClientIdTextfield] = useState(clientId);
  const [laufzeitenTextfield, setLaufzeitenTextfield] = useState(laufzeiten);
  const [zeroMonthTextfield, setZeroMonthTextfield] = useState(zeroMonth);
  const [zinsSaetzeTextfield, setzinsSaetzeTextfield] = useState(zinsSaetze);
  const [aktionszinsTextfield, setaktionszinsTextfield] = useState(aktionszins);
  const [minBestellwertTextfield, setminBestellwertTextfield] = useState(minBestellWert);
  const [hashTextfield, sethashTextfield] = useState(hash);
  const [passwortTextfield, setPasswortTextfield] = useState(passwort);
  const [apiKeyTextfield, setApiKeyTextfield] = useState(apiKey);
  

  const submit = useSubmit();

  function handleSave() {
    const data = {
      id: id,
      apiUsername : apiUsernameTextfield,
      vendorId: vendorIdTextfield,
      clientId: clientIdTextfield,
      laufzeiten: laufzeitenTextfield,
      zeroMonth: zeroMonthTextfield,
      zinsSaetze : zinsSaetzeTextfield,
      aktionszins: aktionszinsTextfield,
      minBestellWert: minBestellwertTextfield,
      shop: shop,
      passwort: passwortTextfield,
      apiKey: apiKeyTextfield,
      hash: hashTextfield,
    };

    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title="Einstellungen"> </ui-title-bar>
      <Tabs tabs={[]} selected={0}></Tabs>
      <HorizontalGrid gap="4" columns={3} >
        <Card> 
          <Text as="h2" variant="headingMd">Consors EFI</Text>
          <TextField
            id="title"
            label="API-Username"
            autoComplete="off"
            value={apiUsernameTextfield}
            onChange={(value) => setapiUsernameTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
          <TextField
            id="title"
            label="VendorID"
            autoComplete="off"
            value={vendorIdTextfield}
            onChange={(value) => setVendorIdTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
          <TextField
            id="title"
            label="ClientID"
            autoComplete="off"
            value={clientIdTextfield}
            onChange={(value) => setClientIdTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
        </Card>
        <Card>
        <Text as="h2" variant="headingMd">Konfigurator</Text>
          <Tooltip content="Mindestlaufzeit, Maximallaufzeit und Schritte">
            <TextField
              id="laufzeiten"
              label="Laufzeiten"
              autoComplete="off"
              value={laufzeitenTextfield}
              onChange={(value) => setLaufzeitenTextfield(value)}
              onBlur={() => handleSave( )}
              error={errors.title}
            />
          </Tooltip>
          <TextField 
            id="zeroMonth"
            label="Monate mit Nullprozentfinanzierung"
            autoComplete="off"
            value={zeroMonthTextfield}
            onChange={(value) => setZeroMonthTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
          <TextField
            id="zinsSaetze"
            label="Zinssätze"
            autoComplete="off"
            value={zinsSaetzeTextfield}
            onChange={(value) => setzinsSaetzeTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
          <TextField
            id="aktionszins"
            label="Aktionszins"
            autoComplete="off"
            value={aktionszinsTextfield}
            onChange={(value) => setaktionszinsTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
           <TextField
            id="minBestellwert"
            label="mindestBestellwert"
            autoComplete="off"
            value={minBestellwertTextfield}
            onChange={(value) => setminBestellwertTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
        </Card>
        <Card>
        <Text as="h2" variant="headingMd">Sicherheit</Text>
          <TextField
            id="passwort"
            label="Passwort"
            autoComplete="off"
            value={passwortTextfield}
            onChange={(value) => setPasswortTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
          <TextField
            id="apiKey"
            label="ApiKey"
            autoComplete="off"
            value={apiKeyTextfield}
            onChange={(value) => setApiKeyTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
          <TextField
            id="hash"
            label="Hash"
            autoComplete="off"
            value={hashTextfield}
            onChange={(value) => sethashTextfield(value)}
            onBlur={() => handleSave( )}
            error={errors.title}
          />
        </Card>
      </HorizontalGrid>
    </Page>
  );
}
