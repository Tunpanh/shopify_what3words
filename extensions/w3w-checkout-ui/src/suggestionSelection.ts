export function resolveSuggestionSelection(value: string | string[]): string | null {
  const selected = Array.isArray(value) ? value[0] : value;
  if (!selected || selected.trim().length === 0) {
    return null;
  }
  return selected;
}

export function getNextActiveSuggestionIndex(
  currentIndex: number,
  total: number,
  key: "ArrowDown" | "ArrowUp" | "Home" | "End"
): number {
  if (total <= 0) {
    return -1;
  }

  switch (key) {
    case "Home":
      return 0;
    case "End":
      return total - 1;
    case "ArrowDown":
      if (currentIndex < 0 || currentIndex >= total - 1) {
        return 0;
      }
      return currentIndex + 1;
    case "ArrowUp":
      if (currentIndex <= 0) {
        return total - 1;
      }
      return currentIndex - 1;
  }
}

