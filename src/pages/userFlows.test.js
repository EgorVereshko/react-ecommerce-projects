import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import CatalogPage from "./CatalogPage";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import { getProduct, getProducts, getSizes } from "../services/api";
import { useCartStore } from "../store/cartStore";

jest.mock("../services/api", () => ({
  getProduct: jest.fn(),
  getProducts: jest.fn(),
  getSizes: jest.fn(),
}));

const products = [
  {
    id: 1,
    name: "Майка",
    brand: "Run&Go",
    colors: [
      { id: 1, name: "черный", images: [], price: "90.00", description: "", sizes: [2] },
      { id: 2, name: "белый", images: [], price: "80.00", description: "", sizes: [1, 2] },
    ],
  },
  { id: 2, name: "Пальто", brand: "WarmLine", colors: [{ id: 1, name: "черный", images: [], price: "499.00", sizes: [] }] },
];
const sizes = [{ id: 1, name: "S", number: 46 }, { id: 2, name: "M", number: 48 }];

function LocationDisplay() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

beforeEach(() => {
  useCartStore.setState({ items: [] });
  getProducts.mockResolvedValue(products);
  getProduct.mockResolvedValue(products[0]);
  getSizes.mockResolvedValue(sizes);
});

afterEach(() => {
  window.localStorage.clear();
});

test("каталог совместно применяет URL-поиск, наличие и сортировку", async () => {
  render(
    <MemoryRouter initialEntries={["/?search=майка&inStock=1&sort=asc"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes><Route path="/" element={<CatalogPage />} /></Routes>
    </MemoryRouter>,
  );
  expect(await screen.findByRole("heading", { name: "Каталог" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Майка/ })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /Пальто/ })).not.toBeInTheDocument();
});

test("детальная страница обновляет URL при выборе доступного варианта и добавляет товар", async () => {
  render(
    <MemoryRouter initialEntries={["/products/1?color=2&size=1"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LocationDisplay />
      <Routes><Route path="/products/:id" element={<ProductPage />} /></Routes>
    </MemoryRouter>,
  );
  expect(await screen.findByRole("heading", { name: "Майка" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "черный" }));
  await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/products/1?color=1"));
  fireEvent.click(screen.getByRole("button", { name: "M" }));
  await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/products/1?color=1&size=2"));
  fireEvent.click(screen.getByRole("button", { name: "Добавить в корзину" }));
  expect(useCartStore.getState().items).toHaveLength(1);
  expect(useCartStore.getState().items[0]).toMatchObject({ productId: "1", colorId: "1", sizeId: "2", quantity: 1 });
});

test("корзина изменяет количество, применяет промокод и сохраняет состояние", async () => {
  useCartStore.setState({
    items: [{
      key: "1-1-2",
      productId: "1",
      colorId: "1",
      sizeId: "2",
      productName: "Майка",
      colorName: "черный",
      sizeName: "M",
      price: 100,
      image: "",
      quantity: 2,
    }],
  });
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CartPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Увеличить количество" }));
  fireEvent.change(screen.getByLabelText("Промокод"), { target: { value: "SALE10" } });
  fireEvent.click(screen.getByRole("button", { name: "Применить" }));
  expect(await screen.findByText("270.00 ₽")).toBeInTheDocument();
  expect(screen.getByText("Промокод SALE10 применён.")).toBeInTheDocument();
  await waitFor(() => {
    const savedItems = JSON.parse(window.localStorage.getItem("react-test-task-cart"));
    expect(savedItems[0].quantity).toBe(3);
  });
});
