# Development Notes

## Generate encryption key

Use one of these:

```bash
openssl rand -base64 32
```

or

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set output as `APP_ENCRYPTION_KEY`.

## Prisma

Schema file:

- `prisma/schema.prisma`

Common commands:

```bash
npx prisma generate
npx prisma migrate dev
```

## Shopify auth routes

- `app/routes/auth.$.tsx` handles OAuth/auth path prefix callbacks via `authenticate.admin`.

## Webhook route

- `app/routes/webhooks.orders.create.tsx`

Expected mapping:

- source: order `note_attributes` key `w3w_address`
- destination metafield: `w3w.address`

## Checkout extension

Location:

- `extensions/w3w-checkout-ui/src/index.tsx`

Current behavior:

- Debounced input
- Mock suggestion source
- Country-aware filtering
- Persist/clear checkout attribute `w3w_address`

## E2E execution modes

1. Local app started by Playwright config:
- no `E2E_BASE_URL` set
- Playwright starts `npm run dev:web`

2. Reuse external running app:
- set `E2E_BASE_URL`
- Playwright skips local web server startup

## Troubleshooting

### Missing extension type definitions

If `npm run typecheck:extension` fails with missing `@shopify/ui-extensions/checkout`, ensure extension dependencies are installed and lockfile is up to date.

### ESLint config migration

Current repo uses `.eslintrc.cjs` while ESLint v9 expects flat config (`eslint.config.js`). Migrate to flat config before enforcing lint in CI.
