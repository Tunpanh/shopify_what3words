import type { SuggestQueryParams, W3WSuggestion } from "./types";

const MIN_QUERY_LENGTH = 3;
const MAX_SUGGESTIONS = 5;
const MOCK_LATENCY_MS = 220;

const MOCK_SUGGESTIONS: W3WSuggestion[] = [
  { words: "filled.count.soap", nearestPlace: "San Francisco, CA", countryCode: "US" },
  { words: "index.home.raft", nearestPlace: "San Jose, CA", countryCode: "US" },
  { words: "limit.broom.flip", nearestPlace: "Austin, TX", countryCode: "US" },
  { words: "planet.inches.mats", nearestPlace: "Toronto, ON", countryCode: "CA" },
  { words: "rescue.ships.hill", nearestPlace: "Vancouver, BC", countryCode: "CA" },
  { words: "crown.toast.lamp", nearestPlace: "London", countryCode: "GB" },
  { words: "pillow.rust.bird", nearestPlace: "Manchester", countryCode: "GB" }
];

const cache = new Map<string, W3WSuggestion[]>();

function abortError() {
  const error = new Error("Request aborted");
  error.name = "AbortError";
  return error;
}

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function buildCacheKey(input: string, countryCode?: string) {
  return `${normalize(input)}::${countryCode?.toUpperCase() ?? "ALL"}`;
}

function queryMatchesSuggestion(input: string, suggestion: W3WSuggestion) {
  const q = normalize(input);
  return (
    suggestion.words.includes(q) ||
    suggestion.nearestPlace.toLowerCase().includes(q) ||
    suggestion.countryCode.toLowerCase() === q
  );
}

function filterSuggestions(input: string, countryCode?: string) {
  const normalizedCountry = countryCode?.toUpperCase();

  return MOCK_SUGGESTIONS.filter((item) => {
    if (normalizedCountry && item.countryCode !== normalizedCountry) {
      return false;
    }
    return queryMatchesSuggestion(input, item);
  }).slice(0, MAX_SUGGESTIONS);
}

export async function fetchMockSuggestions({
  input,
  countryCode,
  signal
}: SuggestQueryParams): Promise<W3WSuggestion[]> {
  const normalizedInput = normalize(input);
  if (normalizedInput.length < MIN_QUERY_LENGTH) {
    return [];
  }

  if (signal?.aborted) {
    throw abortError();
  }

  const cacheKey = buildCacheKey(normalizedInput, countryCode);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const results = await new Promise<W3WSuggestion[]>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(filterSuggestions(normalizedInput, countryCode));
    }, MOCK_LATENCY_MS);

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timeout);
          reject(abortError());
        },
        { once: true }
      );
    }
  });

  cache.set(cacheKey, results);
  return results;
}

export function clearSuggestionCache() {
  cache.clear();
}

