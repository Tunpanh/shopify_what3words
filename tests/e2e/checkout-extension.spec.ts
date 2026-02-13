import { expect, test } from "@playwright/test";
import { requireEnv } from "./helpers";

test.describe("Checkout extension", () => {
  test("shows what3words input and suggestion flow", async ({ page }) => {
    const checkoutUrl = requireEnv("E2E_CHECKOUT_URL");

    await page.goto(checkoutUrl);

    await expect(page.getByText("what3words address (optional)", { exact: false })).toBeVisible();

    const input = page.getByLabel("what3words");
    await input.fill("filled");

    await expect(page.getByText("filled.count.soap", { exact: false })).toBeVisible();
    await page.getByText("filled.count.soap", { exact: false }).click();

    await expect(page.getByText("Saving selected address...", { exact: false })).toBeVisible();
  });
});

