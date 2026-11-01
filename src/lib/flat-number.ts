/**
 * Normalize flat numbers for uniqueness without assuming tower layouts.
 * Examples: " a-101 " → "A-101", "101" → "101", "B  203" → "B-203"
 */
export function normalizeFlatNumber(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  const upper = trimmed.toUpperCase();

  // Collapse spaces around hyphens / convert space between letter and digits to hyphen
  const withHyphen = upper
    .replace(/\s*-\s*/g, "-")
    .replace(/^([A-Z]+)\s+(\d)/, "$1-$2")
    .replace(/\s+/g, "");

  return withHyphen;
}

export function displayFlatNumber(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function isValidFlatNumber(normalized: string): boolean {
  if (!normalized || normalized.length > 20) return false;
  // Letters, digits, hyphen only after normalization
  return /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(normalized);
}
