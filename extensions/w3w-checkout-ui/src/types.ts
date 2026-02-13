export type W3WSuggestion = {
  words: string;
  nearestPlace: string;
  countryCode: string;
};

export type SuggestQueryParams = {
  input: string;
  countryCode?: string;
  signal?: AbortSignal;
};

