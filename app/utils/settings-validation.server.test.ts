import { describe, expect, it } from "vitest";
import { validateWhat3WordsApiKey } from "~/utils/settings-validation.server";

describe("settings-validation.server", () => {
  it("rejects empty API key", () => {
    expect(validateWhat3WordsApiKey("")).toBe("what3words API key is required.");
    expect(validateWhat3WordsApiKey("   ")).toBe("what3words API key is required.");
  });

  it("accepts non-empty API key", () => {
    expect(validateWhat3WordsApiKey("abc123")).toBeUndefined();
  });
});
