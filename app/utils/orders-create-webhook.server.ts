import type { OrdersCreateWebhookPayload } from "~/types/webhooks";

export const W3W_CHECKOUT_ATTRIBUTE_KEY = "w3w_address";
export const W3W_METAFIELD_NAMESPACE = "w3w";
export const W3W_METAFIELD_KEY = "address";

function normalizeAttributeValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getW3WValueFromOrdersCreatePayload(
  payload: OrdersCreateWebhookPayload
): string | null {
  if (!Array.isArray(payload.note_attributes)) {
    return null;
  }

  const attribute = payload.note_attributes.find((item) => item?.name === W3W_CHECKOUT_ATTRIBUTE_KEY);
  return normalizeAttributeValue(attribute?.value);
}

export function getOrderAdminGraphqlId(payload: OrdersCreateWebhookPayload): string | null {
  const gqlId = normalizeAttributeValue(payload.admin_graphql_api_id);
  if (gqlId) {
    return gqlId;
  }

  const rawId = payload.id;
  if (typeof rawId === "number" || typeof rawId === "string") {
    const idText = String(rawId).trim();
    if (idText.length > 0) {
      return `gid://shopify/Order/${idText}`;
    }
  }

  return null;
}

