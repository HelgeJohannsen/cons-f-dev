import db from "../db.server";

export async function getOrCreateConfig(shop) {
  // TODO: check typing
  const config = await db.config.findFirst({ where: { shop } });
  console.log("shop", shop);
  if (!config) {
    const entry = await createConfig(shop);
    return entry;
  }
  return config;
}

export async function isAppLive(shop) {
  const config = await db.config.findFirst({
    where: { shop },
    select: {
      mode: true,
    },
  });
  if (config?.mode == "live") {
    return true;
  } else {
    return false;
  }
}
export async function getPublicConfig(shop) {
  const config = await db.config.findFirst({
    where: { shop },
    select: {
      zinsSaetze: true,
      aktionszins: true,
      aktionsZinsMonate: true,
      laufzeiten: true,
      zeroMonth: true,
      vendorId: true,
      paymentHandle: true,
      shop: true,
      minBestellWert: true,
    },
  });
  console.log("shop", shop);
  if (!config) {
    const entry = await createConfig(shop);
    return entry;
  }
  return config;
}
export async function getConfigRata(shop) {
  const config = await db.config.findFirst({
    where: { shop },
    select: {
      apiKey: true,
      username: true,
      passwort: true,
      vendorId: true,
      mode: true,
    },
  });
  if (config?.mode == "demo") {
    const data = {
      username: "1pstest",
      vendorId: "8403",
      apiKey: "e93c8c99-34ae-4f96-9a3b-8d761c99f013",
      passwort: "ecec8403",
    };
    return data;
  }
  console.log("shop", shop);
  return config;
}

export function getConfig(shop) {
  return db.config.findFirst({ where: { shop } });
}

export async function createConfig(shop) {
  /** @type {any} */
  const data = {
    username: "1pstest",
    vendorId: "8403",
    clientId: "8403",
    laufzeiten: "12,24,6",
    zeroMonth: "12",
    zinsSaetze: "9.0,9.3,9.5",
    aktionszins: 1,
    minBestellWert: 11000,
    shop,
    hash: "1234567890",
    apiKey: "e93c8c99-34ae-4f96-9a3b-8d761c99f013",
    passwort: "",
    paymentHandle: "",
  };

  const Settings = await db.config.create({ data });

  if (!Settings) {
    return null;
  }
  return Settings;
}
