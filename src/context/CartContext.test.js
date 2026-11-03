import { cartReducer } from './CartContext'

describe('cartReducer', () => {
  const firstItem = { productId: 1, colorId: 2, sizeId: 3 }

  it('adds a product, color and size combination once', () => {
    const cartWithItem = cartReducer([], { type: 'add', item: firstItem })
    const cartWithDuplicate = cartReducer(cartWithItem, {
      type: 'add',
      item: firstItem,
    })

    expect(cartWithItem).toEqual([firstItem])
    expect(cartWithDuplicate).toBe(cartWithItem)
  })

  it('keeps different color or size combinations as separate items', () => {
    const secondItem = { productId: 1, colorId: 2, sizeId: 4 }
    const thirdItem = { productId: 1, colorId: 5, sizeId: 3 }

    expect(
      cartReducer([firstItem], { type: 'add', item: secondItem })
    ).toEqual([firstItem, secondItem])
    expect(
      cartReducer([firstItem], { type: 'add', item: thirdItem })
    ).toEqual([firstItem, thirdItem])
  })

  it('removes only the selected product, color and size combination', () => {
    const secondItem = { productId: 1, colorId: 2, sizeId: 4 }
    const cart = [firstItem, secondItem]

    expect(
      cartReducer(cart, {
        type: 'remove',
        key: `${firstItem.productId}:${firstItem.colorId}:${firstItem.sizeId}`,
      })
    ).toEqual([secondItem])
  })
})
