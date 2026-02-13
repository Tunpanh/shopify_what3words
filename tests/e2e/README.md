# E2E Test Requirements

These Playwright tests are designed to run against a running Shopify dev environment.
Each test skips itself when its required env vars are not provided.

## Required env vars by test

### Admin settings test
- `E2E_ADMIN_SETTINGS_URL`: full URL to the authenticated settings page.
- Optional: `E2E_TEST_W3W_API_KEY`.

### Checkout extension test
- `E2E_CHECKOUT_URL`: checkout URL where the extension is loaded.

### Webhook integration test
- `E2E_WEBHOOK_URL`: full URL to `/webhooks/orders/create`.
- `E2E_WEBHOOK_HMAC_SHA256`: valid HMAC for the test payload.
- `E2E_ADMIN_MOCK_LOGS_URL`: URL of your Admin API mock logs endpoint.
- Optional: `E2E_WEBHOOK_SHOP`.

## Running

- `npm run test:e2e`
- `npm run test:e2e:headed`
- `npm run test:e2e:ui`

Set `E2E_BASE_URL` to reuse an already running app instead of launching `npm run dev:web`.
