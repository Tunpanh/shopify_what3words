import { expect, Page, test } from "@playwright/test";

export function env(name: string): string | undefined {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) {
    test.skip(true, `Missing required env variable: ${name}`);
  }
  return value!;
}

export async function assertEitherText(page: Page, expected: string[]) {
  for (const text of expected) {
    if ((await page.getByText(text, { exact: false }).count()) > 0) {
      await expect(page.getByText(text, { exact: false })).toBeVisible();
      return;
    }
  }

  throw new Error(`None of the expected texts were found: ${expected.join(", ")}`);
}

