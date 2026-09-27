export function inr(value: number): string {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

export function discountPct(price: number, mrp: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
