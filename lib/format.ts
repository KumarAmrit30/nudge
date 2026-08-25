export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function stockLabel(stock: number): string {
  if (stock <= 0) {
    return "Out of stock";
  }
  return `${stock} in stock`;
}
