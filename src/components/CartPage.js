import React, { useEffect, useState } from 'react'

import AppLink from './AppLink'
import { useCart } from '../context/CartContext'
import { getProducts, getSizes } from '../services/api'

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(Number(price))
}

export default function CartPage() {
  const { cart, removeItem } = useCart()
  const [products, setProducts] = useState([])
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([getProducts(), getSizes()])
      .then(([loadedProducts, loadedSizes]) => {
        if (active) {
          setProducts(loadedProducts)
          setSizes(loadedSizes)
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || 'Не удалось загрузить корзину.')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const items = cart.map((cartItem) => {
    const product = products.find((entry) => entry.id === cartItem.productId)
    const color = product
      ? product.colors.find((entry) => entry.id === cartItem.colorId)
      : null
    const size = sizes.find((entry) => entry.id === cartItem.sizeId)
    return { cartItem, product, color, size }
  })

  return (
    <main className="page container">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Ваш выбор</p>
          <h1>Корзина</h1>
        </div>
        <span className="muted">
          {cart.length} {cart.length === 1 ? 'товар' : 'товаров'}
        </span>
      </div>

      {loading && <p className="status-message">Загружаем корзину…</p>}
      {error && <p className="status-message error-message">{error}</p>}

      {!loading && !error && cart.length === 0 && (
        <section className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            ◇
          </div>
          <h2>Корзина пока пуста</h2>
          <p>Выберите товар в каталоге и добавьте его сюда.</p>
          <AppLink className="button button-primary" to="/">
            Перейти в каталог
          </AppLink>
        </section>
      )}

      {!loading && !error && cart.length > 0 && (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Товары в корзине">
            {items.map(({ cartItem, product, color, size }) => (
              <article
                className="cart-item"
                key={`${cartItem.productId}:${cartItem.colorId}:${cartItem.sizeId}`}
              >
                {color && color.images[0] ? (
                  <img
                    className="cart-item-image"
                    src={color.images[0]}
                    alt={product.name}
                  />
                ) : (
                  <div className="cart-item-image image-placeholder">Нет фото</div>
                )}
                <div className="cart-item-info">
                  <h2>{product ? product.name : 'Товар недоступен'}</h2>
                  {color && <p>Цвет: {color.name}</p>}
                  {size && (
                    <p>
                      Размер: {size.label} ({size.number})
                    </p>
                  )}
                  {color && <strong>{formatPrice(color.price)}</strong>}
                </div>
                <button
                  className="remove-button"
                  type="button"
                  onClick={() => removeItem(cartItem)}
                  aria-label={`Удалить ${product ? product.name : 'товар'} из корзины`}
                >
                  Удалить
                </button>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <p>Позиций в корзине</p>
            <strong>{cart.length}</strong>
            <AppLink className="text-link" to="/">
              Продолжить покупки
            </AppLink>
          </aside>
        </div>
      )}
    </main>
  )
}
