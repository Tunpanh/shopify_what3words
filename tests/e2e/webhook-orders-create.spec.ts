import { expect, test } from "@playwright/test";
import { requireEnv } from "./helpers";

type MockLogEntry = {
  operationName?: string;
  query?: string;
  variables?: Record<string, unknown>;
};

const ORDERS_CREATE_PAYLOAD = {
  id: 987654321,
  admin_graphql_api_id: "gid://shopify/Order/987654321",
  note_attributes: [{ name: "w3w_address", value: "filled.count.soap" }]
};

test.describe("orders/create webhook", () => {
  test("processes payload and triggers metafieldsSet mutation", async ({ request }) => {
    const webhookUrl = requireEnv("E2E_WEBHOOK_URL");
    const webhookHmac = requireEnv("E2E_WEBHOOK_HMAC_SHA256");
    const webhookShop = process.env.E2E_WEBHOOK_SHOP ?? "test-shop.myshopify.com";
    const adminMockLogsUrl = requireEnv("E2E_ADMIN_MOCK_LOGS_URL");

    const webhookResponse = await request.post(webhookUrl, {
      headers: {
        "content-type": "application/json",
        "x-shopify-topic": "orders/create",
        "x-shopify-shop-domain": webhookShop,
        "x-shopify-hmac-sha256": webhookHmac,
        "x-shopify-webhook-id": `pw-${Date.now()}`
      },
      data: ORDERS_CREATE_PAYLOAD
    });

    expect(webhookResponse.ok()).toBeTruthy();

    const logsResponse = await request.get(adminMockLogsUrl);
    expect(logsResponse.ok()).toBeTruthy();

    const logs = (await logsResponse.json()) as MockLogEntry[];
    expect(logs.length).toBeGreaterThan(0);

    const metafieldsSetCall = logs.find((entry) => {
      if (entry.operationName === "SetOrderW3WMetafield") {
        return true;
      }

      const query = entry.query ?? "";
      return query.includes("metafieldsSet");
    });

    expect(metafieldsSetCall).toBeTruthy();
    expect(JSON.stringify(metafieldsSetCall?.variables ?? {})).toContain("filled.count.soap");
  });
});

