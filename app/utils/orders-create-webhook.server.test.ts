import { describe, expect, it } from "vitest";
import {
  getOrderAdminGraphqlId,
  getW3WValueFromOrdersCreatePayload
} from "~/utils/orders-create-webhook.server";

describe("orders-create-webhook.server", () => {
  it("extracts w3w_address from note attributes", () => {
    const value = getW3WValueFromOrdersCreatePayload({
      note_attributes: [
        { name: "gift_message", value: "hello" },
        { name: "w3w_address", value: "filled.count.soap" }
      ]
    });

    expect(value).toBe("filled.count.soap");
  });

  it("returns null for empty/missing w3w_address", () => {
    expect(
      getW3WValueFromOrdersCreatePayload({
        note_attributes: [{ name: "w3w_address", value: "   " }]
      })
    ).toBeNull();

    expect(getW3WValueFromOrdersCreatePayload({ note_attributes: null })).toBeNull();
  });

  it("prefers admin_graphql_api_id when present", () => {
    const id = getOrderAdminGraphqlId({
      admin_graphql_api_id: "gid://shopify/Order/123",
      id: 999
    });

    expect(id).toBe("gid://shopify/Order/123");
  });

  it("falls back to numeric id", () => {
    expect(getOrderAdminGraphqlId({ id: 123 })).toBe("gid://shopify/Order/123");
    expect(getOrderAdminGraphqlId({ id: "456" })).toBe("gid://shopify/Order/456");
    expect(getOrderAdminGraphqlId({ id: null })).toBeNull();
  });
});
