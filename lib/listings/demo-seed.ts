/**
 * Merge a demo catalogue only when `demo` is true. Production callers pass
 * `false` and get exactly the landlord's own rows — including none.
 *
 * Kept free of mock-data so unit tests can import it from node:test.
 */
export function mergeDemoCatalogue<T extends { id: string }>(
  rows: T[],
  catalogue: T[],
  demo: boolean
): T[] {
  if (!demo) return rows;
  const seen = new Set(rows.map((row) => row.id));
  return [...catalogue.filter((row) => !seen.has(row.id)), ...rows];
}
