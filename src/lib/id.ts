const ALPHABET =
  "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

/**
 * Generate a URL-safe random id using the same alphabet as nanoid.
 * Mirrors the `@default(nanoid(9))` behaviour previously provided by Prisma.
 */
export function nanoid(size = 9): string {
  let id = "";
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) {
    id += ALPHABET[bytes[i] & 63];
  }
  return id;
}

