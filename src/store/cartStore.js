import { create } from "zustand";
import {
  addCartItem,
  changeCartItemQuantity,
  normalizeCartItems,
  removeCartItem,
} from "../utils/cartUtils";

const STORAGE_KEY = "react-test-task-cart";

function readInitialItems() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeCartItems(JSON.parse(stored)) : [];
  } catch (error) {
    console.error("Не удалось восстановить корзину из localStorage.", error);
    return [];
  }
}

export const useCartStore = create((set) => ({
  items: readInitialItems(),
  addItem: (item) => set((state) => ({ items: addCartItem(state.items, item) })),
  increaseItem: (key) => set((state) => ({
    items: changeCartItemQuantity(state.items, key, 1),
  })),
  decreaseItem: (key) => set((state) => ({
    items: changeCartItemQuantity(state.items, key, -1),
  })),
  removeItem: (key) => set((state) => ({ items: removeCartItem(state.items, key) })),
}));

useCartStore.subscribe((state) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch (error) {
    console.error("Не удалось сохранить корзину в localStorage.", error);
  }
});
