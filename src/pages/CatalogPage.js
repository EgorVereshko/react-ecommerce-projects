import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../services/api";
import ProductImage from "../components/ProductImage";
import PageState from "../components/PageState";
import {
  filterProducts,
  getProductPrice,
  sortProductsByPrice,
} from "../utils/productUtils";

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const inStock = params.get("inStock") === "1";
  const sort = ["asc", "desc"].includes(params.get("sort")) ? params.get("sort") : "";

  useEffect(() => {
    let active = true;
    getProducts()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch(() => {
        if (active) setError("Не удалось загрузить каталог. Попробуйте обновить страницу.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(
    () => sortProductsByPrice(filterProducts(products, search, inStock), sort),
    [products, search, inStock, sort],
  );

  function updateParam(name, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next);
  }

  if (loading) return <PageState title="Загружаем каталог…" />;
  if (error) return <PageState title="Ошибка загрузки">{error}</PageState>;

  return (
    <section>
      <div className="page-heading">
        <div><p className="eyebrow">НОВАЯ КОЛЛЕКЦИЯ</p><h1>Каталог</h1></div>
        <p className="muted">{visibleProducts.length} моделей</p>
      </div>
      <div className="catalog-controls">
        <label className="search-control">
          <span>Поиск</span>
          <input
            type="search"
            value={search}
            onChange={(event) => updateParam("search", event.target.value)}
            placeholder="Например, футболка"
          />
        </label>
        <label className="stock-control">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => updateParam("inStock", event.target.checked ? "1" : "")}
          />
          В наличии
        </label>
        <label className="sort-control">
          <span>Цена</span>
          <select value={sort} onChange={(event) => updateParam("sort", event.target.value)}>
            <option value="">Без сортировки</option>
            <option value="asc">Сначала дешевле</option>
            <option value="desc">Сначала дороже</option>
          </select>
        </label>
      </div>
      {visibleProducts.length ? (
        <div className="product-grid">
          {visibleProducts.map((product) => {
            const image = product.colors?.find((color) => color.images?.length)?.images[0];
            return (
              <Link className="product-card" to={`/products/${product.id}`} key={product.id}>
                <ProductImage className="product-card-image" src={image} alt={product.name} />
                <div className="product-card-copy">
                  <div><h2>{product.name}</h2><p>{product.brand}</p></div>
                  <strong>{getProductPrice(product).toFixed(2)} ₽</strong>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <PageState title={products.length ? "Ничего не найдено" : "Каталог пока пуст"}>
          Измените параметры поиска или фильтрации.
        </PageState>
      )}
    </section>
  );
}
