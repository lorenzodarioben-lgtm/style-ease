import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import { STOREFRONT_STORAGE_KEY, readStorefrontState, saveStorefrontState } from './storage.js';

function createStorage(value) {
  return {
    getItem: vi.fn(function () {
      return value || null;
    }),
    setItem: vi.fn()
  };
}

describe('storefront session storage', function () {
  it('restores valid cart variants and wishlisted products safely', function () {
    var storage = createStorage(
      JSON.stringify({
        version: 1,
        cart: [{ id: 1, price: 70, selectedSize: 'M', selectedColor: 'Black' }],
        comparison: [{ id: 4 }],
        recentlyViewed: [{ id: 3 }],
        wishlist: [{ id: 2 }]
      })
    );

    expect(readStorefrontState(storage)).toEqual({
      cart: [
        expect.objectContaining({
          id: 1,
          price: 70,
          selectedSize: 'M',
          selectedColor: 'Black'
        })
      ],
      comparison: [expect.objectContaining({ id: 4 })],
      recentlyViewed: [expect.objectContaining({ id: 3 })],
      wishlist: [expect.objectContaining({ id: 2 })]
    });
  });

  it('ignores malformed, outdated, and unknown stored values', function () {
    expect(readStorefrontState(createStorage('{not json'))).toEqual({});
    expect(readStorefrontState(createStorage(JSON.stringify({ version: 0 })))).toEqual({});
    expect(
      readStorefrontState(
        createStorage(JSON.stringify({ version: 1, cart: [{ id: 999 }], wishlist: [{ id: 999 }] }))
      )
    ).toEqual({ cart: [], comparison: [], recentlyViewed: [], wishlist: [] });
  });

  it('writes a compact versioned snapshot and tolerates storage errors', function () {
    var storage = createStorage();

    saveStorefrontState(
      {
        cart: [Object.assign({}, products[0], { selectedSize: 'M', selectedColor: 'Black' })],
        wishlist: [products[1]]
      },
      storage
    );

    expect(storage.setItem).toHaveBeenCalledWith(
      STOREFRONT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        cart: [{ id: 1, price: 75, quantity: 1, selectedColor: 'Black', selectedSize: 'M' }],
        comparison: [],
        recentlyViewed: [],
        wishlist: [{ id: 2 }]
      })
    );

    expect(function () {
      saveStorefrontState(
        {},
        {
          setItem: function () {
            throw new Error('blocked');
          }
        }
      );
    }).not.toThrow();
  });
});
