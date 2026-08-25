import { CsvParseError, estimateCsvRecordCount, parseRfc4180Csv } from "@/lib/csv";
import { MAX_CSV_BYTES, MAX_CSV_ROWS } from "@/lib/merchant-paths";
import {
  CSV_COLUMNS,
  csvRowSchema,
  type AssociationPair,
  type ImportRowError,
} from "@/lib/merchant-schemas";
import type { Product } from "@/lib/types";

const MERCHANT_ID = "merchant-demo";

export type ImportSuccess = {
  ok: true;
  products: Product[];
  pendingCsv: AssociationPair[];
  acceptedCount: number;
};

export type ImportFailure = {
  ok: false;
  errors: ImportRowError[];
};

export type ImportResult = ImportSuccess | ImportFailure;

function pipeList(value: string): string[] {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function productIdFromSku(sku: string): string {
  const slug = sku
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  return `imp-${slug || "row"}`;
}

function parseSpecifications(
  raw: string,
  rowNumber: number,
): { specs: Record<string, string> } | { error: ImportRowError } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { specs: {} };
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        error: {
          row: rowNumber,
          field: "specifications",
          message: "specifications must be a JSON object.",
        },
      };
    }
    const specs: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== "string") {
        return {
          error: {
            row: rowNumber,
            field: "specifications",
            message: "specifications values must be strings.",
          },
        };
      }
      specs[key] = value;
    }
    return { specs };
  } catch {
    return {
      error: {
        row: rowNumber,
        field: "specifications",
        message: "specifications must be valid JSON.",
      },
    };
  }
}

function headerIndexMap(header: string[]): Map<string, number> | ImportRowError {
  const map = new Map<string, number>();
  header.forEach((name, index) => {
    map.set(name.trim(), index);
  });
  for (const column of CSV_COLUMNS) {
    if (!map.has(column)) {
      return {
        row: 1,
        field: column,
        message: `Missing required column ${column}.`,
      };
    }
  }
  return map;
}

function cell(row: string[], columns: Map<string, number>, name: string): string {
  const index = columns.get(name);
  if (index == null || index >= row.length) {
    return "";
  }
  return row[index] ?? "";
}

export function importCsvText(text: string, byteLength: number): ImportResult {
  if (byteLength > MAX_CSV_BYTES) {
    return {
      ok: false,
      errors: [
        {
          row: 1,
          field: "file",
          message: `File is larger than ${MAX_CSV_BYTES} bytes.`,
        },
      ],
    };
  }

  const estimatedRecords = estimateCsvRecordCount(text);
  if (estimatedRecords > MAX_CSV_ROWS + 1) {
    return {
      ok: false,
      errors: [
        {
          row: 1,
          field: "file",
          message: `File has more than ${MAX_CSV_ROWS} data rows.`,
        },
      ],
    };
  }

  let records: string[][];
  try {
    records = parseRfc4180Csv(text);
  } catch (error) {
    const message =
      error instanceof CsvParseError ? error.message : "CSV could not be parsed.";
    return {
      ok: false,
      errors: [{ row: 1, field: "file", message }],
    };
  }

  if (records.length === 0) {
    return {
      ok: false,
      errors: [{ row: 1, field: "file", message: "CSV is empty." }],
    };
  }

  const columns = headerIndexMap(records[0] ?? []);
  if (!("get" in columns)) {
    return { ok: false, errors: [columns] };
  }

  const dataRows = records.slice(1).filter((row) =>
    row.some((value) => value.trim() !== ""),
  );
  if (dataRows.length === 0) {
    return {
      ok: false,
      errors: [{ row: 1, field: "file", message: "CSV has no data rows." }],
    };
  }
  if (dataRows.length > MAX_CSV_ROWS) {
    return {
      ok: false,
      errors: [
        {
          row: 1,
          field: "file",
          message: `File has more than ${MAX_CSV_ROWS} data rows.`,
        },
      ],
    };
  }

  const errors: ImportRowError[] = [];
  const seenSkus = new Map<string, number>();
  const products: Product[] = [];
  const pendingCsv: AssociationPair[] = [];

  dataRows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const candidate = {
      sku: cell(rawRow, columns, "sku"),
      title: cell(rawRow, columns, "title"),
      description: cell(rawRow, columns, "description"),
      category: cell(rawRow, columns, "category"),
      price_inr: cell(rawRow, columns, "price_inr"),
      stock: cell(rawRow, columns, "stock"),
      image_url: cell(rawRow, columns, "image_url"),
      brand: cell(rawRow, columns, "brand"),
      tags: cell(rawRow, columns, "tags"),
      specifications: cell(rawRow, columns, "specifications"),
      compatible_skus: cell(rawRow, columns, "compatible_skus"),
    };
    const parsed = csvRowSchema.safeParse(candidate);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          row: rowNumber,
          field: String(issue.path[0] ?? "row"),
          message: issue.message,
        });
      }
      return;
    }

    const previousRow = seenSkus.get(parsed.data.sku);
    if (previousRow != null) {
      errors.push({
        row: rowNumber,
        field: "sku",
        message: `Duplicate sku (first seen on row ${previousRow}).`,
      });
      return;
    }
    seenSkus.set(parsed.data.sku, rowNumber);

    const specs = parseSpecifications(parsed.data.specifications, rowNumber);
    if ("error" in specs) {
      errors.push(specs.error);
      return;
    }

    const compatibleSkus = pipeList(parsed.data.compatible_skus);
    products.push({
      id: productIdFromSku(parsed.data.sku),
      merchant_id: MERCHANT_ID,
      sku: parsed.data.sku,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      price_inr: parsed.data.price_inr,
      rating: 0,
      stock: parsed.data.stock,
      brand: parsed.data.brand,
      tags: pipeList(parsed.data.tags),
      image_url: parsed.data.image_url.trim(),
      specifications: specs.specs,
      compatible_skus: [],
    });

    for (const toSku of compatibleSkus) {
      if (toSku !== parsed.data.sku) {
        pendingCsv.push({ fromSku: parsed.data.sku, toSku });
      }
    }
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const skuSet = new Set(products.map((product) => product.sku));
  const pendingExisting = pendingCsv.filter((pair) => skuSet.has(pair.toSku));

  return {
    ok: true,
    products,
    pendingCsv: pendingExisting,
    acceptedCount: products.length,
  };
}
