export function createCartItem(product, color, size) {
  return {
    key: `${product.id}-${color.id}-${size.id}`,
    productId: String(product.id),
    colorId: String(color.id),
    sizeId: String(size.id),
    productName: product.name,
    colorName: color.name,
    sizeName: size.name,
    price: Number(color.price),
    image: Array.isArray(color.images) ? color.images[0] || "" : "",
    quantity: 1,
  };
}

export function addCartItem(items, item) {
  const existing = (items || []).find((entry) => entry.key === item.key);
  if (existing) {
    return items.map((entry) =>
      entry.key === item.key ? { ...entry, quantity: entry.quantity + 1 } : entry,
    );
  }
  return [...(items || []), { ...item, quantity: 1 }];
}

export function normalizeCartItems(value) {
  if (!Array.isArray(value)) return [];
  const normalized = [];

  value.forEach((item) => {
    if (
      !item ||
      item.productId == null ||
      item.colorId == null ||
      item.sizeId == null ||
      !Number.isFinite(Number(item.price)) ||
      Number(item.price) < 0
    ) return;
    const key = `${item.productId}-${item.colorId}-${item.sizeId}`;
    const quantity = Number.isFinite(Number(item.quantity))
      ? Math.max(1, Math.floor(Number(item.quantity)))
      : 1;
    const existing = normalized.find((entry) => entry.key === key);
    if (existing) {
      existing.quantity += quantity;
      return;
    }
    normalized.push({
      key,
      productId: String(item.productId),
      colorId: String(item.colorId),
      sizeId: String(item.sizeId),
      productName: String(item.productName || "Товар"),
      colorName: String(item.colorName || "—"),
      sizeName: String(item.sizeName || "—"),
      price: Number(item.price),
      image: typeof item.image === "string" ? item.image : "",
      quantity,
    });
  });

  return normalized;
}

export function changeCartItemQuantity(items, key, change) {
  return (items || []).map((item) =>
    item.key === key
      ? { ...item, quantity: Math.max(1, Math.floor(item.quantity + change)) }
      : item,
  );
}

export function removeCartItem(items, key) {
  return (items || []).filter((item) => item.key !== key);
}

export function getCartCount(items) {
  return (items || []).reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(items) {
  return (items || []).reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getDiscount(total, promoCode) {
  const code = String(promoCode || "").trim().toUpperCase();
  if (code === "SALE10") return Math.min(total, total * 0.1);
  if (code === "SALE500") return Math.min(total, 500);
  return 0;
}

export function getPromoTotal(total, promoCode) {
  return Math.max(0, total - getDiscount(total, promoCode));
}
