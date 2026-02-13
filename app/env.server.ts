const APP_ENCRYPTION_KEY_ENV = "APP_ENCRYPTION_KEY";
const ENCRYPTION_KEY_BYTES = 32;

function decodeBase64(value: string): Buffer | null {
  try {
    const decoded = Buffer.from(value, "base64");
    if (decoded.toString("base64") === value.replace(/\s+/g, "")) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

function getAppEncryptionKey(): Buffer {
  const rawKey = process.env[APP_ENCRYPTION_KEY_ENV];
  if (!rawKey || rawKey.trim().length === 0) {
    throw new Error(
      `${APP_ENCRYPTION_KEY_ENV} is required and must be set before starting the app.`
    );
  }

  const trimmed = rawKey.trim();

  const base64Key = decodeBase64(trimmed);
  if (base64Key && base64Key.length === ENCRYPTION_KEY_BYTES) {
    return base64Key;
  }

  if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  throw new Error(
    `${APP_ENCRYPTION_KEY_ENV} must be a 32-byte key encoded as base64 or 64-char hex.`
  );
}

export const appEncryptionKey = getAppEncryptionKey();
