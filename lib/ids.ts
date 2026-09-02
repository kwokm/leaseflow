/** Short, sortable-ish ids. Prefixed so a stray id is identifiable in logs. */
export function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 20)
      : Math.random().toString(36).slice(2).padEnd(20, "0").slice(0, 20);
  return `${prefix}_${random}`;
}

const CONFIRMATION_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-readable receipt code (LP-XXXXXX) the renter can quote back. */
export function newConfirmationId(): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  let suffix = "";
  for (const byte of bytes) suffix += CONFIRMATION_ALPHABET[byte % CONFIRMATION_ALPHABET.length];
  return `LP-${suffix}`;
}
