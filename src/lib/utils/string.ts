/**
 * Cleans a transaction description to create a robust matching keyword for automation rules.
 * It removes dates, standard transaction prefixes, card references, and trailing numeric IDs.
 */
export function cleanTransactionDescription(desc: string): string {
  if (!desc) return "";
  
  let cleaned = desc.trim();

  // Remove common banking prefixes (case-insensitive)
  const prefixesToRemove = [
    /^(CARD PAYMENT TO\s+)/i,
    /^(POS\s+)/i,
    /^(DIRECT DEBIT TO\s+)/i,
    /^(DIRECT DEBIT\s+)/i,
    /^(PAYMENT TO\s+)/i,
    /^(PAYMENT FROM\s+)/i,
    /^(BPAY\s+)/i,
    /^(TRANSFER TO\s+)/i,
    /^(TRANSFER FROM\s+)/i,
    /^(DD\s+)/i,
  ];

  for (const regex of prefixesToRemove) {
    cleaned = cleaned.replace(regex, "");
  }

  // Remove dates in formats: DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY, DD-MM-YY, YYYY-MM-DD
  cleaned = cleaned.replace(/\b\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?\b/g, "");
  cleaned = cleaned.replace(/\b\d{4}[\/\-]\d{2}[\/\-]\d{2}\b/g, "");

  // Remove timestamp references (e.g. 14:32:01)
  cleaned = cleaned.replace(/\b\d{2}:\d{2}(:\d{2})?\b/g, "");

  // Remove "ON 28 MAY", "ON 28MAY", etc.
  cleaned = cleaned.replace(/\bON\s+\d{1,2}\s*[a-zA-Z]{3,}\b/i, "");
  cleaned = cleaned.replace(/\bON\s+[a-zA-Z]{3,}\s*\d{1,2}\b/i, "");

  // Remove numeric reference ids or ending *xxxx or card numbers
  cleaned = cleaned.replace(/\*?\b\d{4,}\b/g, ""); // long digits
  cleaned = cleaned.replace(/[\*#]\d+/g, ""); // strings like *1234 or #1234
  
  // Clean up multiple spaces and strip trailing punctuation/whitespace
  cleaned = cleaned.replace(/\s+/g, " ");
  // Strip trailing dashes, commas, stars
  cleaned = cleaned.replace(/[\s\-\*\,]+$/, "");
  // Strip leading dashes, stars
  cleaned = cleaned.replace(/^[\s\-\*\,]+/, "");

  return cleaned.trim() || desc.trim();
}
