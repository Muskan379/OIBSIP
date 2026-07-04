import * as Crypto from "expo-crypto";

/**
 * Hashes a plaintext password using SHA-256 with a static app-level salt.
 *
 * This is a lightweight, local-only hashing scheme intended for an
 * on-device SQLite-style personal task app (no server, no network
 * transmission of credentials). It is NOT suitable for
 * production systems that require industry-grade password storage.
 */
const SALT = "todo-app-local-salt-v1";

export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${SALT}:${password}`,
  );
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const candidate = await hashPassword(password);
  return candidate === hash;
}
