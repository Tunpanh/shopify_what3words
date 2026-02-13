import { describe, expect, it } from "vitest";
import {
  getNextActiveSuggestionIndex,
  resolveSuggestionSelection
} from "./suggestionSelection";

describe("suggestionSelection", () => {
  it("resolves selected suggestion from string or array", () => {
    expect(resolveSuggestionSelection("filled.count.soap")).toBe("filled.count.soap");
    expect(resolveSuggestionSelection(["index.home.raft"])).toBe("index.home.raft");
    expect(resolveSuggestionSelection([""])).toBeNull();
  });

  it("computes next index for arrow/home/end keys", () => {
    expect(getNextActiveSuggestionIndex(-1, 3, "ArrowDown")).toBe(0);
    expect(getNextActiveSuggestionIndex(0, 3, "ArrowDown")).toBe(1);
    expect(getNextActiveSuggestionIndex(2, 3, "ArrowDown")).toBe(0);

    expect(getNextActiveSuggestionIndex(0, 3, "ArrowUp")).toBe(2);
    expect(getNextActiveSuggestionIndex(2, 3, "ArrowUp")).toBe(1);

    expect(getNextActiveSuggestionIndex(2, 3, "Home")).toBe(0);
    expect(getNextActiveSuggestionIndex(0, 3, "End")).toBe(2);
    expect(getNextActiveSuggestionIndex(0, 0, "ArrowDown")).toBe(-1);
  });
});
