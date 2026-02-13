# test-shop

Shopify Remix app (TypeScript) with a Checkout UI extension for what3words checkout capture.

## Development

1. Copy `.env.example` to `.env` and fill required values.
2. Set `shopify.app.toml` placeholders:
- `client_id`
- `application_url`
- `build.dev_store_url`
- `auth.redirect_urls`
3. Install dependencies: `npm install`
4. Start app + extensions together: `npm run dev`

`npm run dev` starts Shopify CLI (`shopify app dev`) and serves:
- Web app process from `shopify.web.toml` (`npm run dev:web`)
- Checkout UI extension from `extensions/w3w-checkout-ui`

## Scripts

- `npm run dev`: run Shopify app + extensions locally
- `npm run dev:web`: run Remix web server only
- `npm run build`: production build for web app
- `npm run typecheck`: type-check web app
- `npm run typecheck:extension`: type-check checkout extension

## Environment

Required:
- `APP_ENCRYPTION_KEY` (32-byte base64 or 64-char hex)
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES`
