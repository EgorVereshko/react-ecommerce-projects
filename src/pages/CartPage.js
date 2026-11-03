import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import PageState from "../components/PageState";
import { useCartStore } from "../store/cartStore";
import {
  getCartCount,
  getCartTotal,
  getDiscount,
  getPromoTotal,
} from "../utils/cartUtils";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const subtotal = getCartTotal(items);
  const discount = getDiscount(subtotal, appliedPromo);

  function applyPromo(event) {
    event.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoMessage("Введите промокод.");
      return;
    }
    if (code !== "SALE10" && code !== "SALE500") {
      setPromoMessage("Промокод не найден.");
      return;
    }
    if (code === appliedPromo) {
      setPromoMessage("Этот промокод уже применён.");
      return;
    }
    setAppliedPromo(code);
    setPromoInput(code);
    setPromoMessage(`Промокод ${code} применён.`);
  }

  if (!items.length) {
    return (
      <PageState title="Корзина пуста">
        <p>Добавьте товары из каталога, чтобы оформить подборку.</p>
        <Link className="primary-button inline-button" to="/">Перейти в каталог</Link>
      </PageState>
    );
  }

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow">ВАШ ВЫБОР</p><h1>Корзина</h1></div><p className="muted">{getCartCount(items)} товара</p></div>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.key}>
              <ProductImage className="cart-image" src={item.image} alt={item.productName} />
              <div className="cart-item-info">
                <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                <p>{item.colorName} · размер {item.sizeName}</p>
                <strong>{item.price.toFixed(2)} ₽</strong>
              </div>
              <div className="quantity-control" aria-label={`Количество товара ${item.productName}`}>
                <button type="button" onClick={() => decreaseItem(item.key)} aria-label="Уменьшить количество">−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => increaseItem(item.key)} aria-label="Увеличить количество">+</button>
              </div>
              <div className="cart-line-total">
                <strong>{(item.price * item.quantity).toFixed(2)} ₽</strong>
                <button className="remove-button" type="button" onClick={() => removeItem(item.key)}>Удалить</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <h2>Итого</h2>
          <form className="promo-form" onSubmit={applyPromo}>
            <label htmlFor="promo">Промокод</label>
            <div><input id="promo" value={promoInput} onChange={(event) => setPromoInput(event.target.value)} placeholder="SALE10" /><button type="submit">Применить</button></div>
            <p className="promo-hint">SALE10 — скидка 10%, SALE500 — скидка 500 ₽</p>
          </form>
          {promoMessage && <p className="notice" role="status">{promoMessage}</p>}
          <div className="summary-row"><span>Товары ({getCartCount(items)})</span><span>{subtotal.toFixed(2)} ₽</span></div>
          {appliedPromo && <div className="summary-row discount-row"><span>Скидка {appliedPromo} <button type="button" onClick={() => { setAppliedPromo(""); setPromoMessage("Промокод удалён."); }}>Удалить</button></span><span>−{discount.toFixed(2)} ₽</span></div>}
          <div className="summary-total"><span>К оплате</span><strong>{getPromoTotal(subtotal, appliedPromo).toFixed(2)} ₽</strong></div>
          <p className="muted summary-count">Всего позиций: {getCartCount(items)}</p>
        </aside>
      </div>
    </section>
  );
}
