import { z } from "zod";

export const CSV_COLUMNS = [
  "sku",
  "title",
  "description",
  "category",
  "price_inr",
  "stock",
  "image_url",
  "brand",
  "tags",
  "specifications",
  "compatible_skus",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

export const csvRowSchema = z.object({
  sku: z.string().trim().min(1, "sku is required"),
  title: z.string().trim().min(1, "title is required"),
  description: z.string(),
  category: z.string(),
  price_inr: z.coerce.number().finite().nonnegative("price_inr must be 0 or greater"),
  stock: z.coerce.number().int().nonnegative("stock must be an integer 0 or greater"),
  image_url: z.string(),
  brand: z.string(),
  tags: z.string(),
  specifications: z.string(),
  compatible_skus: z.string(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

export const associationPairSchema = z.object({
  fromSku: z.string().min(1),
  toSku: z.string().min(1),
});

export const associationStateSchema = z.object({
  dismissed: z.array(associationPairSchema).default([]),
  pendingCsv: z.array(associationPairSchema).default([]),
});

export type AssociationPair = z.infer<typeof associationPairSchema>;
export type AssociationState = z.infer<typeof associationStateSchema>;

export const importRowErrorSchema = z.object({
  row: z.number().int().positive(),
  field: z.string(),
  message: z.string(),
});

export const importStatusSchema = z.object({
  timestamp: z.string(),
  ok: z.boolean(),
  acceptedCount: z.number().int().nonnegative(),
  errors: z.array(importRowErrorSchema),
});

export type ImportRowError = z.infer<typeof importRowErrorSchema>;
export type ImportStatus = z.infer<typeof importStatusSchema>;
