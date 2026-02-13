import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  AppProvider,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField
} from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { useEffect, useMemo, useState } from "react";
import prisma from "~/db.server";
import { encrypt } from "~/utils/encryption.server";

type ActionData = {
  ok: boolean;
  errors?: {
    shop?: string;
    apiKey?: string;
  };
  values?: {
    shop: string;
  };
};

type LoaderData = {
  shop: string;
  hasApiKey: boolean;
  updatedAt: string | null;
};

const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

function normalizeShop(raw: FormDataEntryValue | string | null): string {
  if (typeof raw !== "string") {
    return "";
  }
  return raw.trim().toLowerCase();
}

function validateShop(shop: string): string | undefined {
  if (!shop) {
    return "Shop domain is required.";
  }
  if (!SHOP_DOMAIN_PATTERN.test(shop)) {
    return "Shop domain must look like store-name.myshopify.com.";
  }
  return undefined;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = normalizeShop(url.searchParams.get("shop"));

  if (!shop || !SHOP_DOMAIN_PATTERN.test(shop)) {
    return json<LoaderData>({
      shop: "",
      hasApiKey: false,
      updatedAt: null
    });
  }

  const settings = await prisma.shopSettings.findUnique({
    where: { shop },
    select: { updatedAt: true }
  });

  return json<LoaderData>({
    shop,
    hasApiKey: Boolean(settings),
    updatedAt: settings?.updatedAt.toISOString() ?? null
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const shop = normalizeShop(formData.get("shop"));
  const apiKey = String(formData.get("apiKey") ?? "").trim();

  const shopError = validateShop(shop);
  const apiKeyError = apiKey.length === 0 ? "what3words API key is required." : undefined;

  if (shopError || apiKeyError) {
    return json<ActionData>(
      {
        ok: false,
        errors: {
          shop: shopError,
          apiKey: apiKeyError
        },
        values: {
          shop
        }
      },
      { status: 400 }
    );
  }

  const encryptedApiKey = encrypt(apiKey);

  await prisma.shopSettings.upsert({
    where: { shop },
    update: { encryptedApiKey },
    create: {
      shop,
      encryptedApiKey
    }
  });

  return json<ActionData>({
    ok: true,
    values: {
      shop
    }
  });
}

export default function AppSettingsRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [shop, setShop] = useState(actionData?.values?.shop ?? loaderData.shop);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const nextShop = actionData?.values?.shop ?? loaderData.shop;
    setShop(nextShop);
  }, [actionData?.values?.shop, loaderData.shop]);

  const isSubmitting = navigation.state === "submitting";
  const formattedUpdatedAt = useMemo(() => {
    if (!loaderData.updatedAt) {
      return null;
    }
    return new Date(loaderData.updatedAt).toLocaleString();
  }, [loaderData.updatedAt]);

  return (
    <AppProvider i18n={en}>
      <Page title="Settings">
        <BlockStack gap="400">
          {actionData?.ok ? (
            <Banner tone="success" title="Settings saved">
              <p>what3words API key has been encrypted and stored for this shop.</p>
            </Banner>
          ) : null}

          {!loaderData.shop ? (
            <Banner tone="info" title="Provide a shop domain">
              <p>Enter the connected shop domain to store settings per shop.</p>
            </Banner>
          ) : null}

          <Card>
            <Form method="post">
              <FormLayout>
                <TextField
                  label="Shop domain"
                  name="shop"
                  value={shop}
                  onChange={setShop}
                  autoComplete="off"
                  placeholder="store-name.myshopify.com"
                  error={actionData?.errors?.shop}
                  helpText="Settings are saved per Shopify shop domain."
                />
                <TextField
                  label="what3words API key"
                  name="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={setApiKey}
                  autoComplete="off"
                  error={actionData?.errors?.apiKey}
                  helpText="Stored encrypted at rest using AES-256-GCM."
                />
                <Box>
                  <Button submit variant="primary" loading={isSubmitting}>
                    Save settings
                  </Button>
                </Box>
              </FormLayout>
            </Form>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingSm">
                Current status
              </Text>
              <Text as="p" variant="bodyMd">
                API key configured: {loaderData.hasApiKey ? "Yes" : "No"}
              </Text>
              <Text as="p" variant="bodyMd">
                Last updated: {formattedUpdatedAt ?? "Not set"}
              </Text>
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>
    </AppProvider>
  );
}
