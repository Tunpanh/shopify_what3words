import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import type { OrdersCreateWebhookPayload } from "~/types/webhooks";
import {
  getOrderAdminGraphqlId,
  getW3WValueFromOrdersCreatePayload,
  W3W_METAFIELD_KEY,
  W3W_METAFIELD_NAMESPACE
} from "~/utils/orders-create-webhook.server";

type OrderMetafieldQueryResponse = {
  data?: {
    order?: {
      metafield?: {
        value?: string | null;
      } | null;
    } | null;
  };
};

type MetafieldsSetResponse = {
  data?: {
    metafieldsSet?: {
      userErrors?: Array<{
        message: string;
      }>;
    };
  };
};

const GET_ORDER_W3W_METAFIELD_QUERY = `#graphql
  query GetOrderW3WMetafield($id: ID!, $namespace: String!, $key: String!) {
    order(id: $id) {
      metafield(namespace: $namespace, key: $key) {
        value
      }
    }
  }
`;

const SET_ORDER_W3W_METAFIELD_MUTATION = `#graphql
  mutation SetOrderW3WMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors {
        message
      }
    }
  }
`;

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, webhookId, payload, admin, session } = await authenticate.webhook(request);

  if (!session || !admin) {
    console.info(`[webhook:${topic}] skipped for ${shop}: no active session`);
    return new Response(null, { status: 200 });
  }

  const ordersPayload = payload as OrdersCreateWebhookPayload;
  const w3wAddress = getW3WValueFromOrdersCreatePayload(ordersPayload);
  const orderId = getOrderAdminGraphqlId(ordersPayload);

  if (!w3wAddress || !orderId) {
    console.info(`[webhook:${topic}] ${shop} ${webhookId}: no w3w_address to persist`);
    return new Response(null, { status: 200 });
  }

  const existingMetafieldResponse = await admin.graphql(GET_ORDER_W3W_METAFIELD_QUERY, {
    variables: {
      id: orderId,
      namespace: W3W_METAFIELD_NAMESPACE,
      key: W3W_METAFIELD_KEY
    }
  });

  const existingMetafieldData = (await existingMetafieldResponse.json()) as OrderMetafieldQueryResponse;
  const existingValue = existingMetafieldData.data?.order?.metafield?.value?.trim();
  if (existingValue === w3wAddress) {
    console.info(`[webhook:${topic}] ${shop} ${webhookId}: metafield already up to date`);
    return new Response(null, { status: 200 });
  }

  const metafieldsSetResponse = await admin.graphql(SET_ORDER_W3W_METAFIELD_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId: orderId,
          namespace: W3W_METAFIELD_NAMESPACE,
          key: W3W_METAFIELD_KEY,
          type: "single_line_text_field",
          value: w3wAddress
        }
      ]
    }
  });

  const metafieldsSetData = (await metafieldsSetResponse.json()) as MetafieldsSetResponse;
  const userErrors = metafieldsSetData.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    console.error(
      `[webhook:${topic}] ${shop} ${webhookId}: metafieldsSet userErrors`,
      userErrors
    );
    return new Response(null, { status: 500 });
  }

  console.info(
    `[webhook:${topic}] ${shop} ${webhookId}: persisted w3w metafield for order ${orderId}`
  );
  return new Response(null, { status: 200 });
}

