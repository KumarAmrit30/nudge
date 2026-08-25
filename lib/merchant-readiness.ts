import { getProducts } from "@/lib/catalog";

export type ReadinessIssueType =
  | "missing_image"
  | "invalid_price"
  | "missing_stock"
  | "blank_description"
  | "empty_tags";

export type ReadinessIssue = {
  sku: string;
  issue: ReadinessIssueType;
};

export function catalogReadinessIssues(): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];

  for (const product of getProducts()) {
    if (!product.image_url?.trim()) {
      issues.push({ sku: product.sku, issue: "missing_image" });
    }
    if (typeof product.price_inr !== "number" || !Number.isFinite(product.price_inr) || product.price_inr < 0) {
      issues.push({ sku: product.sku, issue: "invalid_price" });
    }
    if (typeof product.stock !== "number" || !Number.isFinite(product.stock)) {
      issues.push({ sku: product.sku, issue: "missing_stock" });
    }
    if (!product.description?.trim()) {
      issues.push({ sku: product.sku, issue: "blank_description" });
    }
    if (!product.tags || product.tags.length === 0) {
      issues.push({ sku: product.sku, issue: "empty_tags" });
    }
  }

  return issues;
}
