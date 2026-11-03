import React, { useEffect, useState } from 'react'

import ProductCard from './ProductCard'
import { getProducts } from '../services/api'

export default function ProductListPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getProducts()
      .then((result) => {
        if (active) {
          setProducts(result)
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || 'Не удалось загрузить каталог.')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="page container">
      <section className="page-intro">
        <p className="eyebrow">Новая коллекция</p>
        <h1>Одежда на каждый день</h1>
        <p>Выберите модель, цвет и подходящий размер.</p>
      </section>

      <section aria-labelledby="catalog-heading">
        <div className="section-heading">
          <h2 id="catalog-heading">Каталог</h2>
          {!loading && !error && (
            <span className="muted">{products.length} товара</span>
          )}
        </div>

        {loading && <p className="status-message">Загружаем товары…</p>}
        {error && <p className="status-message error-message">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="status-message">Товары пока не добавлены.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
