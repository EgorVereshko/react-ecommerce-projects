import React, { useEffect, useState } from 'react'

import AppLink from './AppLink'
import { useCart } from '../context/CartContext'
import { getProduct, getSizes } from '../services/api'

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(Number(price))
}

export default function ProductPage({ productId }) {
  const [product, setProduct] = useState(null)
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedColorId, setSelectedColorId] = useState(null)
  const [selectedSizeId, setSelectedSizeId] = useState(null)
  const [imageIndex, setImageIndex] = useState(0)
  const { cart, addItem } = useCart()

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setProduct(null)
    setSelectedColorId(null)
    setSelectedSizeId(null)
    setImageIndex(0)

    Promise.all([getProduct(productId), getSizes()])
      .then(([loadedProduct, loadedSizes]) => {
        if (active) {
          setProduct(loadedProduct)
          setSizes(loadedSizes)
          setSelectedColorId(
            loadedProduct.colors.length > 0 ? loadedProduct.colors[0].id : null
          )
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message === 'Product not found'
              ? 'Товар не найден.'
              : requestError.message || 'Не удалось загрузить товар.'
          )
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [productId])

  if (loading) {
    return (
      <main className="page container">
        <p className="status-message">Загружаем товар…</p>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="page container">
        <p className="status-message error-message">
          {error || 'Не удалось загрузить товар.'}
        </p>
        <AppLink className="text-link" to="/">
          Вернуться в каталог
        </AppLink>
      </main>
    )
  }

  const selectedColor =
    product.colors.find((color) => color.id === selectedColorId) ||
    product.colors[0]

  if (!selectedColor) {
    return (
      <main className="page container">
        <p className="status-message">Для этого товара нет вариантов цвета.</p>
        <AppLink className="text-link" to="/">
          Вернуться в каталог
        </AppLink>
      </main>
    )
  }

  const availableImageCount = selectedColor.images.length
  const currentImage = selectedColor.images[imageIndex]
  const selectedSize = sizes.find((size) => size.id === selectedSizeId)
  const cartItem = selectedSize
    ? {
        productId: product.id,
        colorId: selectedColor.id,
        sizeId: selectedSize.id,
      }
    : null
  const alreadyInCart =
    cartItem &&
    cart.some(
      (item) =>
        item.productId === cartItem.productId &&
        item.colorId === cartItem.colorId &&
        item.sizeId === cartItem.sizeId
    )

  function changeColor(colorId) {
    setSelectedColorId(colorId)
    setSelectedSizeId(null)
    setImageIndex(0)
  }

  function changeImage(direction) {
    setImageIndex(
      (currentIndex) =>
        (currentIndex + direction + availableImageCount) % availableImageCount
    )
  }

  function handleAddToCart() {
    if (cartItem && !alreadyInCart) {
      addItem(cartItem)
    }
  }

  return (
    <main className="page container">
      <div className="breadcrumbs">
        <AppLink className="text-link" to="/">
          Каталог
        </AppLink>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <section className="gallery" aria-label="Изображения товара">
          <div className="gallery-main">
            {currentImage ? (
              <img src={currentImage} alt={`${product.name}, ${selectedColor.name}`} />
            ) : (
              <span className="image-placeholder">Нет изображения</span>
            )}
            {availableImageCount > 1 && (
              <div className="gallery-controls">
                <button
                  type="button"
                  onClick={() => changeImage(-1)}
                  aria-label="Предыдущее изображение"
                >
                  ←
                </button>
                <span>
                  {imageIndex + 1} / {availableImageCount}
                </span>
                <button
                  type="button"
                  onClick={() => changeImage(1)}
                  aria-label="Следующее изображение"
                >
                  →
                </button>
              </div>
            )}
          </div>
          {availableImageCount > 1 && (
            <div className="gallery-thumbnails">
              {selectedColor.images.map((image, index) => (
                <button
                  className={index === imageIndex ? 'thumbnail active' : 'thumbnail'}
                  key={image}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Показать изображение ${index + 1}`}
                  aria-pressed={index === imageIndex}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="product-options">
          <p className="eyebrow">Коллекция · {product.name}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(selectedColor.price)}</p>
          <p className="product-description">{selectedColor.description}</p>

          <fieldset className="option-group">
            <legend>
              Цвет <span className="muted">/ {selectedColor.name}</span>
            </legend>
            <div className="color-options">
              {product.colors.map((color) => (
                <button
                  className={
                    color.id === selectedColor.id ? 'color-option selected' : 'color-option'
                  }
                  key={color.id}
                  type="button"
                  onClick={() => changeColor(color.id)}
                  aria-label={`Цвет: ${color.name}`}
                  aria-pressed={color.id === selectedColor.id}
                  title={color.name}
                >
                  <img src={color.images[0]} alt="" />
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="option-group">
            <legend>Размер</legend>
            <div className="size-options">
              {sizes.map((size) => {
                const isAvailable = selectedColor.sizes.includes(size.id)
                return (
                  <button
                    className={
                      size.id === selectedSizeId ? 'size-option selected' : 'size-option'
                    }
                    key={size.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSizeId(size.id)}
                    aria-pressed={size.id === selectedSizeId}
                    title={`${size.label} — ${size.number}`}
                  >
                    {size.label}
                  </button>
                )
              })}
            </div>
            <p className="helper-text">
              {selectedColor.sizes.length
                ? 'Недоступные размеры отмечены серым.'
                : 'Для этого цвета сейчас нет доступных размеров.'}
            </p>
          </fieldset>

          <button
            className="button button-primary add-to-cart"
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedSize || alreadyInCart}
          >
            {!selectedSize
              ? 'Выберите размер'
              : alreadyInCart
                ? 'Уже в корзине'
                : 'Добавить в корзину'}
          </button>
        </section>
      </div>
    </main>
  )
}
