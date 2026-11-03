import React from 'react'

import AppLink from './AppLink'

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(Number(price))
}

export default function ProductCard({ product }) {
  const firstColor = product.colors[0]
  const image = firstColor && firstColor.images[0]
  const price = firstColor && firstColor.price

  return (
    <AppLink
      className="product-card"
      to={`/products/${product.id}`}
      aria-label={`Открыть товар: ${product.name}`}
    >
      <div className="product-card-image">
        {image ? (
          <img src={image} alt={`${product.name}, ${firstColor.name}`} />
        ) : (
          <span className="image-placeholder">Нет изображения</span>
        )}
      </div>
      <div className="product-card-info">
        <h2>{product.name}</h2>
        <p>{firstColor ? formatPrice(price) : 'Цена не указана'}</p>
      </div>
      <span className="card-arrow" aria-hidden="true">
        →
      </span>
    </AppLink>
  )
}
