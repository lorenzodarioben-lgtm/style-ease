import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import {
  STOREFRONT_STORAGE_KEY,
  clearStorefrontState,
  readStorefrontState,
  saveStorefrontState
} from './storage.js';

function createStorage(value) {
  return {
    getItem: vi.fn(function () {
      return value || null;
    }),
    removeItem: vi.fn(),
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
      orders: [],
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
    ).toEqual({ cart: [], comparison: [], orders: [], recentlyViewed: [], wishlist: [] });
  });

  it('restores only safe monetary values and recalculates receipt totals', function () {
    var state = readStorefrontState(
      createStorage(
        JSON.stringify({
          version: 1,
          cart: [{ id: 1, price: -10 }],
          orders: [
            {
              createdAt: '2026-08-03T00:00:00.000Z',
              customer: { name: 'Ada Shopper' },
              id: 'DEMO-1',
              items: [{ id: 1, price: -10, quantity: 2 }],
              paymentMethod: 'cash',
              total: -20
            }
          ]
        })
      )
    );

    expect(state.cart[0].price).toBe(products[0].price);
    expect(state.orders[0]).toMatchObject({
      paymentMethod: 'credit',
      total: products[0].price * 2
    });
    expect(state.orders[0].customer).toBeUndefined();
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
        orders: [],
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

  it('serializes compact, sanitized receipt data', function () {
    var storage = createStorage();

    saveStorefrontState(
      {
        orders: [
          {
            createdAt: '2026-08-03T00:00:00.000Z',
            customer: { email: 'ada@example.com', name: 'Ada Shopper' },
            id: 'DEMO-1',
            items: [Object.assign({}, products[0], { price: -1, quantity: 2 })],
            paymentMethod: 'unknown',
            total: -2
          }
        ]
      },
      storage
    );

    expect(JSON.parse(storage.setItem.mock.calls[0][1]).orders).toEqual([
      {
        createdAt: '2026-08-03T00:00:00.000Z',
        id: 'DEMO-1',
        items: [{ id: 1, price: 75, quantity: 2, selectedColor: '', selectedSize: '' }],
        paymentMethod: 'credit',
        total: 150
      }
    ]);
  });

  it('removes only the storefront snapshot when requested', function () {
    var storage = createStorage();

    expect(clearStorefrontState(storage)).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledWith(STOREFRONT_STORAGE_KEY);
  });
});
