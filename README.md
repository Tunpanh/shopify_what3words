# test-shop

Shopify Remix app (TypeScript) with:

- Shopify Admin settings page (Polaris) for what3words API key management
- Checkout UI extension for optional what3words capture
- `orders/create` webhook persistence into order metafields
- Unit tests (Vitest) and E2E tests (Playwright)

## Architecture

### Components

1. Admin app (`app/`)
- `app/routes/app.settings.tsx`: authenticated settings page
- Stores per-shop encrypted what3words API key in `ShopSettings`

2. Checkout UI extension (`extensions/w3w-checkout-ui/`)
- Target: `purchase.checkout.delivery-address.render-after`
- Captures optional what3words value
- Persists selection to checkout attribute key `w3w_address`

3. Webhook handler
- `app/routes/webhooks.orders.create.tsx`
- Receives `orders/create`
- Reads `w3w_address` from order `note_attributes`
- Writes order metafield: `namespace=w3w`, `key=address`, `type=single_line_text_field`

4. Auth/session layer
- `app/shopify.server.ts` uses official `shopifyApp()` and `PrismaSessionStorage`

### Data flow

1. Merchant saves what3words API key in Admin settings.
2. API key is encrypted with AES-256-GCM and stored in DB (`ShopSettings.encryptedApiKey`).
3. Buyer selects a what3words value in checkout extension.
4. Extension writes `w3w_address` to checkout attributes.
5. On order creation, webhook maps `w3w_address` -> order metafield `w3w.address`.

## Security

- API keys are never stored in plaintext.
- Encryption key is app-level env var: `APP_ENCRYPTION_KEY`.
- App fails startup if `APP_ENCRYPTION_KEY` is missing/invalid (`app/env.server.ts`).
- Webhooks are verified via `authenticate.webhook(request)` from Shopify Remix helpers.

## Project structure

- `app/`: Remix server/client app code
- `extensions/w3w-checkout-ui/`: Checkout UI extension
- `prisma/`: DB schema
- `tests/`: test setup + E2E tests
- `.github/workflows/`: CI workflow

## Prerequisites

- Node 20.x
- npm 10+
- Shopify CLI
- A Shopify dev store

## Setup

1. Copy env template:
```bash
cp .env.example .env
```

2. Set required env vars in `.env`:
- `APP_ENCRYPTION_KEY`
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES`

3. Update `shopify.app.toml` placeholders:
- `client_id`
- `application_url`
- `build.dev_store_url`
- `auth.redirect_urls`

4. Install dependencies:
```bash
npm install
```

## Running locally

- Run app + extension (Shopify CLI):
```bash
npm run dev
```

- Run Remix web server only:
```bash
npm run dev:web
```

## Testing

- Typecheck:
```bash
npm run typecheck
```

- Unit tests:
```bash
npm run test:unit
```

- E2E tests:
```bash
npm run test:e2e
```

E2E test env requirements are documented in `tests/e2e/README.md`.

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

CI runs:
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`

The CI E2E run uses env-based test skipping for scenarios that require live Shopify URLs/secrets.

## Operational notes

- Orders without `w3w_address` are safely ignored by webhook handler.
- Webhook writes are idempotent by checking existing metafield value before mutation.
- Extension field remains optional and non-blocking for checkout completion.

## Additional docs

- `tests/e2e/README.md`
- `docs/development.md`
