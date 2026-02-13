export function validateWhat3WordsApiKey(apiKey: string): string | undefined {
  if (apiKey.trim().length === 0) {
    return "what3words API key is required.";
  }
  return undefined;
}

