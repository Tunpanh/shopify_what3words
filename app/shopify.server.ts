import "@shopify/shopify-app-remix/server/adapters/node";
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES!.split(","),
  appUrl: process.env.SHOPIFY_APP_URL!,
  sessionStorage: new PrismaSessionStorage(prisma)
});

export const authenticate = shopify.authenticate;
