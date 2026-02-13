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
import { useMemo, useState } from "react";
import prisma from "~/db.server";
import { authenticate } from "~/shopify.server";
import { encrypt } from "~/utils/encryption.server";

type ActionData = {
  ok: boolean;
  errors?: {
    apiKey?: string;
  };
};

type LoaderData = {
  shop: string;
  hasApiKey: boolean;
  updatedAt: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

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
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const apiKey = String(formData.get("apiKey") ?? "").trim();

  const apiKeyError = apiKey.length === 0 ? "what3words API key is required." : undefined;

  if (apiKeyError) {
    return json<ActionData>(
      {
        ok: false,
        errors: {
          apiKey: apiKeyError
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
    ok: true
  });
}

export default function AppSettingsRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [apiKey, setApiKey] = useState("");

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

          <Card>
            <Form method="post">
              <FormLayout>
                <Text as="p" variant="bodyMd">
                  Connected shop: <strong>{loaderData.shop}</strong>
                </Text>
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
