import React, { useCallback, useEffect, useState } from 'react'

import CartPage from './components/CartPage'
import Header from './components/Header'
import ProductListPage from './components/ProductListPage'
import ProductPage from './components/ProductPage'
import { CartProvider } from './context/CartContext'
import { NavigationContext } from './context/NavigationContext'

function getRoute(pathname) {
  if (pathname === '/cart') {
    return { type: 'cart' }
  }

  const productMatch = pathname.match(/^\/products\/(\d+)\/?$/)
  if (productMatch) {
    return { type: 'product', productId: productMatch[1] }
  }

  if (pathname === '/') {
    return { type: 'catalog' }
  }

  return { type: 'not-found' }
}

function NotFoundPage() {
  return (
    <main className="page container">
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или вернитесь в каталог.</p>
    </main>
  )
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
      setPathname(path)
    }
  }, [])

  const route = getRoute(pathname)
  let page

  if (route.type === 'catalog') {
    page = <ProductListPage />
  } else if (route.type === 'product') {
    page = <ProductPage productId={route.productId} />
  } else if (route.type === 'cart') {
    page = <CartPage />
  } else {
    page = <NotFoundPage />
  }

  return (
    <CartProvider>
      <NavigationContext.Provider value={navigate}>
        <div className="app-shell">
          <Header />
          {page}
          <footer className="site-footer">
            <div className="container">Каталог товаров</div>
          </footer>
        </div>
      </NavigationContext.Provider>
    </CartProvider>
  )
}
