/**
 * Small RFC4180-compatible CSV parser for the merchant upload format.
 * Zod is used later to validate parsed rows; it does not parse CSV.
 */
export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Cheap pre-parse bound: counts newline-separated records, including the header. */
export function estimateCsvRecordCount(text: string): number {
  const normalized = stripBom(text);
  if (normalized.length === 0) {
    return 0;
  }
  const parts = normalized.split(/\r\n|\n|\r/);
  if (parts.at(-1) === "") {
    parts.pop();
  }
  return parts.length;
}

export function parseRfc4180Csv(text: string): string[][] {
  const input = stripBom(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  const pushRow = () => {
    row.push(field);
    rows.push(row);
    row = [];
    field = "";
  };

  while (i < input.length) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }

    if (char === "\r") {
      if (input[i + 1] === "\n") {
        i += 1;
      }
      pushRow();
      i += 1;
      continue;
    }

    if (char === "\n") {
      pushRow();
      i += 1;
      continue;
    }

    field += char;
    i += 1;
  }

  if (inQuotes) {
    throw new CsvParseError("Unclosed quoted field.");
  }

  if (field.length > 0 || row.length > 0) {
    pushRow();
  } else if (rows.length === 0 && input.length === 0) {
    return [];
  }

  return rows;
}
