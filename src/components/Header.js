import React from 'react'

import AppLink from './AppLink'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { cart } = useCart()

  return (
    <header className="site-header">
      <div className="container header-content">
        <AppLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span>Место вещей</span>
        </AppLink>
        <nav aria-label="Основная навигация">
          <AppLink className="cart-link" to="/cart">
            Корзина <span className="cart-count">{cart.length}</span>
          </AppLink>
        </nav>
      </div>
    </header>
  )
}
