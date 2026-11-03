import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'

const STORAGE_KEY = 'react-test-task-cart'
const CartContext = createContext(null)

function isCartItem(value) {
  return (
    value &&
    Number.isInteger(value.productId) &&
    Number.isInteger(value.colorId) &&
    Number.isInteger(value.sizeId)
  )
}

function readCart() {
  try {
    const savedCart = window.localStorage.getItem(STORAGE_KEY)
    const parsedCart = savedCart ? JSON.parse(savedCart) : []

    if (!Array.isArray(parsedCart)) {
      throw new Error('Saved cart must be an array')
    }

    return parsedCart.filter(isCartItem)
  } catch (error) {
    console.error('Unable to read the saved cart from localStorage.', error)
    return []
  }
}

function getItemKey(item) {
  return `${item.productId}:${item.colorId}:${item.sizeId}`
}

export function cartReducer(cart, action) {
  if (action.type === 'add') {
    if (cart.some((item) => getItemKey(item) === getItemKey(action.item))) {
      return cart
    }

    return [...cart, action.item]
  }

  if (action.type === 'remove') {
    return cart.filter((item) => getItemKey(item) !== action.key)
  }

  return cart
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, readCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Unable to save the cart to localStorage.', error)
    }
  }, [cart])

  const addItem = useCallback((item) => {
    dispatch({ type: 'add', item })
  }, [])

  const removeItem = useCallback((item) => {
    dispatch({ type: 'remove', key: getItemKey(item) })
  }, [])

  const value = useMemo(
    () => ({ cart, addItem, removeItem }),
    [cart, addItem, removeItem]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new Error('useCart must be used within CartProvider')
  }

  return cart
}
