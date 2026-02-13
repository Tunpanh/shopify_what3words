import { useEffect, useMemo, useState } from "react";
import {
  BlockStack,
  Choice,
  ChoiceList,
  Text,
  TextField,
  reactExtension,
  useShippingAddress
} from "@shopify/ui-extensions-react/checkout";
import { fetchMockSuggestions } from "./mockSuggestions";
import type { W3WSuggestion } from "./types";
import { useDebouncedValue } from "./useDebouncedValue";

const DEBOUNCE_MS = 300;

export default reactExtension("purchase.checkout.delivery-address.render-after", () => (
  <What3WordsInput />
));

function What3WordsInput() {
  const shippingAddress = useShippingAddress();
  const countryCode = shippingAddress?.countryCode;

  const [inputValue, setInputValue] = useState("");
  const [liveInput, setLiveInput] = useState("");
  const [suggestions, setSuggestions] = useState<W3WSuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | undefined>();

  const debouncedInput = useDebouncedValue(liveInput, DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedInput.trim().length < 3) {
      setSuggestions([]);
      setSelectedSuggestionId("");
      setIsLoading(false);
      setFetchError(undefined);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setFetchError(undefined);

    fetchMockSuggestions({
      input: debouncedInput,
      countryCode,
      signal: controller.signal
    })
      .then((result) => {
        setSuggestions(result);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setSuggestions([]);
        setFetchError("Could not load suggestions.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedInput, countryCode]);

  const showSuggestions = suggestions.length > 0;
  const showNoResults =
    !isLoading && !fetchError && debouncedInput.trim().length >= 3 && suggestions.length === 0;

  const countryHint = useMemo(() => {
    if (!countryCode) {
      return "Country-aware filtering will apply after shipping country is available.";
    }
    return `Suggestions are filtered to ${countryCode}.`;
  }, [countryCode]);

  const handleInput = (value: string) => {
    setLiveInput(value);
    setFetchError(undefined);
  };

  const handleChange = (value: string) => {
    setInputValue(value);
    setLiveInput(value);
    setSelectedSuggestionId("");
  };

  const handleSuggestionSelect = (value: string | string[]) => {
    const selected = Array.isArray(value) ? value[0] : value;
    if (!selected) {
      return;
    }
    setSelectedSuggestionId(selected);
    setInputValue(selected);
    setLiveInput(selected);
  };

  return (
    <BlockStack spacing="tight">
      <Text emphasis="bold">what3words address (optional)</Text>
      <Text size="small">
        Start typing a 3-word address. Use keyboard navigation in the suggestions list to choose.
      </Text>
      <TextField
        label="what3words"
        value={inputValue}
        onInput={handleInput}
        onChange={handleChange}
        autocomplete="off"
        placeholder="filled.count.soap"
      />
      <Text size="small" appearance="subdued">
        {countryHint}
      </Text>

      {isLoading ? (
        <Text size="small" appearance="subdued">
          Loading suggestions...
        </Text>
      ) : null}

      {fetchError ? (
        <Text size="small" appearance="critical">
          {fetchError}
        </Text>
      ) : null}

      {showNoResults ? (
        <Text size="small" appearance="subdued">
          No matching what3words suggestions.
        </Text>
      ) : null}

      {showSuggestions ? (
        <ChoiceList
          name="w3w-suggestions"
          value={selectedSuggestionId}
          onChange={handleSuggestionSelect}
          variant="group"
        >
          {suggestions.map((suggestion) => (
            <Choice
              key={suggestion.words}
              id={suggestion.words}
              secondaryContent={suggestion.countryCode}
              tertiaryContent={suggestion.nearestPlace}
            >
              {suggestion.words}
            </Choice>
          ))}
        </ChoiceList>
      ) : null}
    </BlockStack>
  );
}
