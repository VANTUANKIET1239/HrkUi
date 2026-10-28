// Stable identity shared with Core.Localization and tools/localization/build-seed.mjs.
// These algorithm constants must not vary by deployment or by language.
const FNV_OFFSET_BASIS = 14695981039346656037n;
const FNV_PRIME = 1099511628211n;
const HASH_BITS = 64;
const KEY_PREFIX = 'text_';
const HEX_LENGTH = 16;
const KEY_CACHE_LIMIT = 4096;
const keys = new Map<string, string>();

export function textKey(text: string): string {
  const existing = keys.get(text);
  if (existing) return existing;
  let hash = FNV_OFFSET_BASIS;
  for (const value of new TextEncoder().encode(text)) hash = BigInt.asUintN(HASH_BITS, (hash ^ BigInt(value)) * FNV_PRIME);
  const key = KEY_PREFIX + hash.toString(16).padStart(HEX_LENGTH, '0');
  if (keys.size < KEY_CACHE_LIMIT) keys.set(text, key);
  return key;
}
