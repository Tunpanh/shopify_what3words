import { beforeEach, describe, expect, it } from "vitest";
import { clearSuggestionCache, fetchMockSuggestions } from "./mockSuggestions";

describe("mockSuggestions", () => {
  beforeEach(() => {
    clearSuggestionCache();
  });

  it("returns empty for short input", async () => {
    const result = await fetchMockSuggestions({ input: "fi", countryCode: "US" });
    expect(result).toEqual([]);
  });

  it("filters suggestions by country", async () => {
    const result = await fetchMockSuggestions({ input: "filled", countryCode: "US" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.countryCode === "US")).toBe(true);
  });

  it("caches results per query/country", async () => {
    const first = await fetchMockSuggestions({ input: "index", countryCode: "US" });
    const second = await fetchMockSuggestions({ input: "index", countryCode: "US" });

    expect(second).toBe(first);
  });

  it("aborts in-flight requests", async () => {
    const controller = new AbortController();
    const promise = fetchMockSuggestions({
      input: "filled",
      countryCode: "US",
      signal: controller.signal
    });

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
