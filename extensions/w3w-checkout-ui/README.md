# w3w-checkout-ui

Checkout UI extension skeleton targeting the shipping address section.

Scope for this commit:

- Extension registration and target wiring
- TypeScript entrypoint scaffold
- Accessible input with debounced, country-filtered mock suggestions
- In-memory caching and request abort handling for suggestion lookups
- Persist selected what3words value to checkout attributes (`w3w_address`)
- Clear checkout attribute when input is cleared or edited after selection

Out of scope for this commit:

- what3words API calls
