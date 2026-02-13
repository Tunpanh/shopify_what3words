import { expect, test } from "@playwright/test";
import { assertEitherText, requireEnv } from "./helpers";

test.describe("Admin settings", () => {
  test("saves what3words API key from settings page", async ({ page }) => {
    const settingsUrl = requireEnv("E2E_ADMIN_SETTINGS_URL");
    const apiKey = process.env.E2E_TEST_W3W_API_KEY ?? "test-key-for-e2e";

    await page.goto(settingsUrl);

    await assertEitherText(page, ["Settings", "what3words"]);

    const apiKeyInput = page.getByLabel("what3words API key");
    await expect(apiKeyInput).toBeVisible();
    await apiKeyInput.fill(apiKey);

    await page.getByRole("button", { name: /save settings/i }).click();

    await expect(page.getByText("Settings saved", { exact: false })).toBeVisible();
  });
});

