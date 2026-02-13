# w3w-checkout-ui

Checkout UI extension skeleton targeting the shipping address section.

Scope for this commit:

- Extension registration and target wiring
- TypeScript entrypoint scaffold
- Accessible input with debounced, country-filtered mock suggestions
- In-memory caching and request abort handling for suggestion lookups

Out of scope for this commit:

- what3words API calls
- checkout attribute persistence
