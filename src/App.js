import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./store/cartStore";
import { getCartCount, getCartTotal } from "./utils/cartUtils";

function AppLayout() {
  const items = useCartStore((state) => state.items);
  const count = getCartCount(items);
  const total = getCartTotal(items);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">STUDIO / STORE</Link>
        <nav aria-label="Основная навигация">
          <Link to="/">Каталог</Link>
          <Link className="cart-link" to="/cart">
            Корзина <span>{count} товара · {total.toFixed(2)} ₽</span>
          </Link>
        </nav>
      </header>
      <main className="page-content">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<section className="state-card"><h1>Страница не найдена</h1><Link to="/">Вернуться в каталог</Link></section>} />
        </Routes>
      </main>
      <footer className="site-footer">Базовые вещи на каждый день</footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppLayout />
    </BrowserRouter>
  );
}
