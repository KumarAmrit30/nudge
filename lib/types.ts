export type Product = {
  id: string;
  merchant_id: string;
  sku: string;
  title: string;
  description: string;
  category: string;
  price_inr: number;
  rating: number;
  stock: number;
  brand: string;
  tags: string[];
  image_url: string;
  specifications: Record<string, string>;
  compatible_skus: string[];
};

export type SearchProductsInput = {
  query?: string;
  category?: string;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  brand?: string;
};

export type ParsedQuery = {
  tokens: string[];
  maxPrice?: number;
  ramGb?: number;
};
