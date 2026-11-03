export function getProductPrice(product) {
  const prices = (product?.colors || [])
    .map((color) => Number(color.price))
    .filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : 0;
}

export function isProductAvailable(product) {
  return (product?.colors || []).some(
    (color) => Array.isArray(color.sizes) && color.sizes.length > 0,
  );
}

export function filterProducts(products, search, inStockOnly) {
  const normalizedSearch = String(search || "").trim().toLocaleLowerCase();
  return (products || []).filter((product) => {
    const matchesSearch = product.name.toLocaleLowerCase().includes(normalizedSearch);
    return matchesSearch && (!inStockOnly || isProductAvailable(product));
  });
}

export function sortProductsByPrice(products, direction) {
  const sorted = [...(products || [])];
  if (direction !== "asc" && direction !== "desc") return sorted;
  return sorted.sort((a, b) => {
    const difference = getProductPrice(a) - getProductPrice(b);
    return direction === "asc" ? difference : -difference;
  });
}
