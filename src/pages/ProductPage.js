import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getProduct, getSizes } from "../services/api";
import ProductImage from "../components/ProductImage";
import PageState from "../components/PageState";
import { createCartItem } from "../utils/cartUtils";
import { useCartStore } from "../store/cartStore";

export default function ProductPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getProduct(id), getSizes()])
      .then(([loadedProduct, loadedSizes]) => {
        if (!active) return;
        setProduct(loadedProduct);
        setSizes(loadedSizes);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.message.includes("Product not found")) setNotFound(true);
        else setError("Не удалось загрузить товар. Попробуйте обновить страницу.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const colorId = params.get("color");
  const selectedColor = product?.colors?.find((color) => String(color.id) === colorId)
    || product?.colors?.[0]
    || null;
  const selectedSize = sizes.find((size) =>
    String(size.id) === params.get("size")
    && selectedColor?.sizes?.some((idValue) => String(idValue) === String(size.id)),
  ) || null;
  const availableImages = useMemo(
    () => selectedColor?.images?.filter(Boolean) || [],
    [selectedColor],
  );

  useEffect(() => {
    if (!product || !selectedColor) return;
    const next = new URLSearchParams(params);
    let changed = false;
    if (params.get("color") !== String(selectedColor.id)) {
      next.set("color", String(selectedColor.id));
      changed = true;
    }
    const requestedSize = params.get("size");
    if (requestedSize && !selectedSize) {
      next.delete("size");
      changed = true;
    }
    if (changed) setParams(next, { replace: true });
  }, [product, selectedColor, selectedSize, params, setParams]);

  useEffect(() => setImageIndex(0), [selectedColor]);

  function selectColor(color) {
    const next = new URLSearchParams(params);
    next.set("color", String(color.id));
    const existingSize = next.get("size");
    if (!color.sizes?.some((sizeId) => String(sizeId) === existingSize)) next.delete("size");
    setParams(next);
    setNotice("");
  }

  function selectSize(size) {
    const next = new URLSearchParams(params);
    next.set("size", String(size.id));
    setParams(next);
    setNotice("");
  }

  function addToCart() {
    if (!product || !selectedColor || !selectedSize) {
      setNotice("Выберите доступный размер и цвет.");
      return;
    }
    addItem(createCartItem(product, selectedColor, selectedSize));
    setNotice("Товар добавлен в корзину.");
  }

  if (loading) return <PageState title="Загружаем товар…" />;
  if (notFound) return <PageState title="Товар не найден"><Link to="/">Вернуться в каталог</Link></PageState>;
  if (error) return <PageState title="Ошибка загрузки">{error}</PageState>;
  if (!product) return <PageState title="Товар не найден"><Link to="/">Вернуться в каталог</Link></PageState>;

  return (
    <section>
      <Link className="back-link" to="/">← Каталог</Link>
      <div className="product-detail">
        <div className="gallery">
          {availableImages.length ? (
            <>
              <ProductImage className="detail-image" src={availableImages[imageIndex]} alt={`${product.name}, ${selectedColor.name}`} />
              {availableImages.length > 1 && (
                <div className="gallery-controls">
                  <button type="button" onClick={() => setImageIndex((imageIndex - 1 + availableImages.length) % availableImages.length)} aria-label="Предыдущее изображение">←</button>
                  <span>{imageIndex + 1} / {availableImages.length}</span>
                  <button type="button" onClick={() => setImageIndex((imageIndex + 1) % availableImages.length)} aria-label="Следующее изображение">→</button>
                </div>
              )}
            </>
          ) : <div className="image-placeholder detail-image">Изображения отсутствуют</div>}
        </div>
        <div className="product-info">
          <p className="eyebrow">{product.brand}</p>
          <h1>{product.name}</h1>
          <div className="detail-price">{selectedColor ? Number(selectedColor.price).toFixed(2) : "—"} ₽</div>
          {selectedColor && <p className="description">{selectedColor.description}</p>}
          <fieldset>
            <legend>Цвет: <span>{selectedColor?.name || "нет вариантов"}</span></legend>
            <div className="option-list">
              {(product.colors || []).map((color) => (
                <button
                  type="button"
                  className={`option-button ${selectedColor?.id === color.id ? "selected" : ""}`}
                  key={color.id}
                  onClick={() => selectColor(color)}
                  aria-pressed={selectedColor?.id === color.id}
                >{color.name}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Размер: <span>{selectedSize?.name || "не выбран"}</span></legend>
            {sizes.length ? (
              <div className="option-list">
                {sizes.map((size) => {
                  const available = selectedColor?.sizes?.some((sizeId) => String(sizeId) === String(size.id));
                  return (
                    <button
                      type="button"
                      className={`option-button size-button ${selectedSize?.id === size.id ? "selected" : ""}`}
                      key={size.id}
                      disabled={!available}
                      onClick={() => selectSize(size)}
                      aria-pressed={selectedSize?.id === size.id}
                    >{size.name}</button>
                  );
                })}
              </div>
            ) : <p className="muted">Размеры недоступны.</p>}
          </fieldset>
          <button className="primary-button add-button" type="button" onClick={addToCart} disabled={!selectedSize}>
            Добавить в корзину
          </button>
          {notice && <p className="notice" role="status">{notice}</p>}
        </div>
      </div>
    </section>
  );
}
