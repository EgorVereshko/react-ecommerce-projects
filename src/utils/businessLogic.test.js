import {
  addCartItem,
  getCartTotal,
  getDiscount,
  getPromoTotal,
  normalizeCartItems,
  removeCartItem,
} from "./cartUtils";
import {
  filterProducts,
  getProductPrice,
  isProductAvailable,
  sortProductsByPrice,
} from "./productUtils";

const availableProduct = {
  id: 1,
  name: "Футболка",
  colors: [{ id: 1, price: "123.00", sizes: [] }, { id: 2, price: "120.00", sizes: [1] }],
};
const unavailableProduct = {
  id: 2,
  name: "Пальто",
  colors: [{ id: 1, price: "499.00", sizes: [] }],
};
const cartItem = {
  key: "1-2-3",
  productId: "1",
  colorId: "2",
  sizeId: "3",
  productName: "Футболка",
  colorName: "белый",
  sizeName: "M",
  price: 125,
  image: "/shirt.png",
  quantity: 1,
};

test("определяет наличие хотя бы одного размера у любого цвета", () => {
  expect(isProductAvailable(availableProduct)).toBe(true);
  expect(isProductAvailable(unavailableProduct)).toBe(false);
});

test("вычисляет минимальную цену среди цветов", () => {
  expect(getProductPrice(availableProduct)).toBe(120);
});

test("ищет товар по названию без учета регистра", () => {
  expect(filterProducts([availableProduct, unavailableProduct], "ФУТБ", false)).toEqual([availableProduct]);
});

test("фильтрует каталог по наличию", () => {
  expect(filterProducts([availableProduct, unavailableProduct], "", true)).toEqual([availableProduct]);
});

test("сортирует каталог по минимальной цене", () => {
  expect(sortProductsByPrice([availableProduct, unavailableProduct], "asc")).toEqual([availableProduct, unavailableProduct]);
  expect(sortProductsByPrice([availableProduct, unavailableProduct], "desc")).toEqual([unavailableProduct, availableProduct]);
});

test("добавляет новую позицию с количеством один", () => {
  expect(addCartItem([], cartItem)).toEqual([cartItem]);
});

test("увеличивает количество существующей комбинации", () => {
  expect(addCartItem([cartItem], cartItem)[0].quantity).toBe(2);
});

test("удаляет позицию по уникальному ключу", () => {
  expect(removeCartItem([cartItem], cartItem.key)).toEqual([]);
});

test("считает общую стоимость позиций", () => {
  expect(getCartTotal([{ ...cartItem, quantity: 3 }])).toBe(375);
});

test("рассчитывает процентную и фиксированную скидки с ограничением суммы", () => {
  expect(getDiscount(1000, "SALE10")).toBe(100);
  expect(getDiscount(300, "SALE500")).toBe(300);
  expect(getPromoTotal(300, "SALE500")).toBe(0);
});

test("очищает некорректное количество и объединяет дубликаты корзины", () => {
  const restored = normalizeCartItems([
    { ...cartItem, quantity: -4 },
    { ...cartItem, quantity: 2 },
  ]);
  expect(restored).toHaveLength(1);
  expect(restored[0].quantity).toBe(3);
});
