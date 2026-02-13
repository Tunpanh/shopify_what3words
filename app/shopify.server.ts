export type ShopifyAppConfig = {
  apiKey: string;
  apiSecretKey: string;
  scopes: string[];
  appUrl: string;
};

const configFromEnv = (): ShopifyAppConfig => ({
  apiKey: process.env.SHOPIFY_API_KEY ?? "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET ?? "",
  scopes: (process.env.SCOPES ?? "").split(",").map((scope) => scope.trim()).filter(Boolean),
  appUrl: process.env.SHOPIFY_APP_URL ?? ""
});

export const shopifyConfig = configFromEnv();

