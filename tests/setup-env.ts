if (!process.env.APP_ENCRYPTION_KEY) {
  process.env.APP_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
}

if (!process.env.SHOPIFY_API_KEY) {
  process.env.SHOPIFY_API_KEY = "test-api-key";
}

if (!process.env.SHOPIFY_API_SECRET) {
  process.env.SHOPIFY_API_SECRET = "test-api-secret";
}

if (!process.env.SHOPIFY_APP_URL) {
  process.env.SHOPIFY_APP_URL = "https://example.test";
}

if (!process.env.SCOPES) {
  process.env.SCOPES = "read_orders,write_orders,write_metafields";
}

