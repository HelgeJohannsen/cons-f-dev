import { getConfigRata } from "../../models/config.server";

function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

function jwtExpiresAt(jwt: string): number {
  const payload = parseJwt(jwt);
  //payload.exp
  //payload.data.exp  // TODO: is this field needed ?
  if (payload.exp != payload.data.exp) {
    console.warn("JWT with two different values for .exp and .data.exp", jwt);
  }
  return payload.exp * 1000; // jtw.ext uses seconds, javascript uses milliseconds for timestamps
}

interface ApiAuthData {
  apiKey: string;
  username: string;
  password: string;
  vendorId: string;
}

const jwtMinimalAcceptableLiveTime = 2 * 60 * 1000; // 2min

const CONSORS_API_VERSION = "6.5";

export class ConsorsAPI {
  private jwtData?: {
    jwt: string;
    jwtValideUntil: number;
  };

  constructor(public authData: ApiAuthData) {
    this.jwtData = undefined;
  }

  private async getNewJWT(): Promise<string | undefined> {
    // console.log("getting new consors JWT");
    const response = await fetch(
      `https://api.consorsfinanz.de/common-services/cfg/token/${this.authData.vendorId}`,
      {
        method: "POST",
        headers: {
          "x-api-key": this.authData.apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: this.authData.username,
          password: this.authData.password,
        }),
      }
    );
    if (response.ok) {
      // console.log("jwt response", response);
      return response
        .json()
        .then((body) => body["token"].substring("Bearer ".length));
    } else {
      console.error("jwt not OK response", response);
      return undefined;
    }
  }

  async jwt(): Promise<string | undefined> {
    //return this.getNewJWT()
    // TODO: Token läuft ab
    if (
      this.jwtData == undefined ||
      this.jwtData.jwtValideUntil - jwtMinimalAcceptableLiveTime < Date.now()
    ) {
      return this.getNewJWT().then((jwt) => {
        if (jwt === undefined) {
          this.jwtData = undefined;
          return undefined;
        } else {
          this.jwtData = {
            jwt,
            jwtValideUntil: jwtExpiresAt(jwt),
          };
          return jwt;
        }
      });
    } else {
      return this.jwtData.jwt;
    }
  }

  async provideOrderId(
    transactionId: string,
    subscriptionIdentifierExternal: bigint
  ) {
    const clientId = this.authData.vendorId;
    const consorsUrl = `https://api.consorsfinanz.de/ratanet-api/cfg/subscription/${clientId}/transaction/partnerdata?version=${CONSORS_API_VERSION}`;

    const consorsAuthToken = await this.jwt();

    const res = await fetch(consorsUrl, {
      method: "PUT",
      headers: {
        "x-api-key": this.authData.apiKey,
        "Content-Type": "application/json",
        Authorization: `Bearer ${consorsAuthToken}`,
      },
      body: JSON.stringify({
        subscriptionIdentifierExternal:
          subscriptionIdentifierExternal.toString(),
        transactionId,
      }),
    });
    // TODO: check status code usw.
    return res;
  }
  async stornoOrder(transactionId: string) {
    const clientId = this.authData.vendorId;
    // console.log("storno transactionId", transactionId);
    // console.log("storno clientId", clientId);
    const consorsUrl = `https://api.consorsfinanz.de/ratanet-api/cfg/subscription/${clientId}/${transactionId}/partnerdata?version=${CONSORS_API_VERSION}`;

    const consorsAuthToken = await this.jwt();
    // console.log("storno with url", consorsUrl);
    const res = await fetch(consorsUrl, {
      method: "DELETE",
      headers: {
        "x-api-key": this.authData.apiKey,
        "Content-Type": "application/json",
        Authorization: `Bearer ${consorsAuthToken}`,
      },
    });
    // TODO: check status code usw.
    return res;
  }

  async fulfillmentOrder(transactionId: string) {
    const clientId = this.authData.vendorId;
    // console.log("Fulfillment transactionId", transactionId);
    // console.log("Fulfillment clientId", clientId);
    const consorsUrl = `https://api.consorsfinanz.de/ratanet-api/cfg/deliverystatus/${clientId}/${transactionId}/partnerdata?version=${CONSORS_API_VERSION}`;

    const consorsAuthToken = await this.jwt();
    // console.log("Fulfillment with url", consorsUrl);
    const res = await fetch(consorsUrl, {
      method: "PUT",
      headers: {
        "x-api-key": this.authData.apiKey,
        "Content-Type": "application/json",
        Authorization: `Bearer ${consorsAuthToken}`,
      },
    });
    // TODO: check status code usw.
    return res;
  }
}

const consorsClientCache: { [shop: string]: ConsorsAPI | undefined } = {};

export async function resetConsorsClient(shop: string) {
  consorsClientCache[shop] = undefined;
}

export async function getConsorsClient(shop: string) {
  // console.log("consorsClientCache", consorsClientCache);
  const chachedClient = consorsClientCache[shop];
  const config = await getConfigRata(shop);

  if (config == undefined) {
    return undefined;
  }
  if (chachedClient != undefined) {
    if (
      chachedClient.authData.apiKey === config.apiKey &&
      chachedClient.authData.password === config.passwort &&
      chachedClient.authData.username === config.username &&
      chachedClient.authData.vendorId === config.vendorId
    ) {
      return chachedClient;
    }
  }
  const newClient = new ConsorsAPI({
    apiKey: config.apiKey,
    username: config.username,
    password: config.passwort,
    vendorId: config.vendorId,
  });

  consorsClientCache[shop] = newClient;
  return newClient;
}

export const demoMockApi = new ConsorsAPI({
  apiKey: "e93c8c99-34ae-4f96-9a3b-8d761c99f013",
  username: "1pstest",
  password: "ecec8403",
  vendorId: "8403",
});
