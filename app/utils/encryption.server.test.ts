import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "~/utils/encryption.server";

describe("encryption.server", () => {
  it("encrypts and decrypts a value", () => {
    const plaintext = "w3w-api-key-123";

    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.toBe(plaintext);
    expect(decrypted).toBe(plaintext);
  });

  it("uses random IVs so same plaintext encrypts differently", () => {
    const plaintext = "same-secret";

    const encryptedA = encrypt(plaintext);
    const encryptedB = encrypt(plaintext);

    expect(encryptedA).not.toBe(encryptedB);
    expect(decrypt(encryptedA)).toBe(plaintext);
    expect(decrypt(encryptedB)).toBe(plaintext);
  });

  it("throws when encrypted payload is tampered", () => {
    const encrypted = encrypt("tamper-me");
    const [version, iv, authTag, ciphertext] = encrypted.split(":");
    const tamperedAuthTag = `${authTag.slice(0, -2)}aa`;
    const tampered = [version, iv, tamperedAuthTag, ciphertext].join(":");

    expect(() => decrypt(tampered)).toThrow();
  });
});
