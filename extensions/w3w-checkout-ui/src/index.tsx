import { useEffect, useMemo, useState } from "react";
import {
  BlockStack,
  Choice,
  ChoiceList,
  Text,
  TextField,
  reactExtension,
  useApplyAttributeChange,
  useAttributes,
  useShippingAddress
} from "@shopify/ui-extensions-react/checkout";
import { fetchMockSuggestions } from "./mockSuggestions";
import { resolveSuggestionSelection } from "./suggestionSelection";
import type { W3WSuggestion } from "./types";
import { useDebouncedValue } from "./useDebouncedValue";

const DEBOUNCE_MS = 300;
const CHECKOUT_ATTRIBUTE_KEY = "w3w_address";

export default reactExtension("purchase.checkout.delivery-address.render-after", () => (
  <What3WordsInput />
));

function What3WordsInput() {
  const applyAttributeChange = useApplyAttributeChange();
  const attributes = useAttributes();
  const shippingAddress = useShippingAddress();
  const countryCode = shippingAddress?.countryCode;

  const [inputValue, setInputValue] = useState("");
  const [liveInput, setLiveInput] = useState("");
  const [suggestions, setSuggestions] = useState<W3WSuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | undefined>();
  const [isSavingAttribute, setIsSavingAttribute] = useState(false);
  const [attributeError, setAttributeError] = useState<string | undefined>();

  const debouncedInput = useDebouncedValue(liveInput, DEBOUNCE_MS);
  const existingAttributeValue = useMemo(() => {
    const attribute = attributes?.find((item) => item.key === CHECKOUT_ATTRIBUTE_KEY);
    return attribute?.value?.trim() ?? "";
  }, [attributes]);

  useEffect(() => {
    if (!existingAttributeValue || inputValue.trim().length > 0) {
      return;
    }

    setInputValue(existingAttributeValue);
    setLiveInput(existingAttributeValue);
    setSelectedSuggestionId(existingAttributeValue);
  }, [existingAttributeValue, inputValue]);

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

  const persistCheckoutAttribute = async (words: string | null) => {
    setIsSavingAttribute(true);
    setAttributeError(undefined);

    const result = words
      ? await applyAttributeChange({
          type: "updateAttribute",
          key: CHECKOUT_ATTRIBUTE_KEY,
          value: words
        })
      : await applyAttributeChange({
          type: "removeAttribute",
          key: CHECKOUT_ATTRIBUTE_KEY
        });

    if (result.type === "error") {
      setAttributeError(result.message || "Could not update checkout attribute.");
    }

    setIsSavingAttribute(false);
  };

  const handleInput = (value: string) => {
    setLiveInput(value);
    setFetchError(undefined);
  };

  const handleChange = (value: string) => {
    const previousSelectedValue = selectedSuggestionId;
    setInputValue(value);
    setLiveInput(value);
    setSelectedSuggestionId("");
    setAttributeError(undefined);

    if (value.trim().length === 0) {
      void persistCheckoutAttribute(null);
      return;
    }

    if (previousSelectedValue && previousSelectedValue !== value) {
      void persistCheckoutAttribute(null);
    }
  };

  const handleSuggestionSelect = (value: string | string[]) => {
    const selected = resolveSuggestionSelection(value);
    if (!selected) {
      return;
    }
    setSelectedSuggestionId(selected);
    setInputValue(selected);
    setLiveInput(selected);
    void persistCheckoutAttribute(selected);
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
      <Text size="small" appearance="subdued">
        Saved to checkout attribute: {CHECKOUT_ATTRIBUTE_KEY}
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

      {isSavingAttribute ? (
        <Text size="small" appearance="subdued">
          Saving selected address...
        </Text>
      ) : null}

      {attributeError ? (
        <Text size="small" appearance="critical">
          {attributeError}
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
