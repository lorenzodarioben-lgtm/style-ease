import { describe, expect, it } from 'vitest';
import { products } from '../data/catalog.js';
import { readStorefrontState, saveStorefrontState } from './storage.js';
import { createStorefrontStore } from './storefront.js';

function createMemoryStorage() {
  var value = null;

  return {
    getItem: function () {
      return value;
    },
    setItem: function (_, nextValue) {
      value = nextValue;
    }
  };
}

describe('storefront purchase flow', function () {
  it('carries variants, quantities, saved styles, and receipts across a browser session', function () {
    var storage = createMemoryStorage();
    var store = createStorefrontStore();
    var shirt = Object.assign({}, products[0], {
      selectedColor: 'Black',
      selectedSize: 'M',
      quantity: 2
    });
    var jacket = Object.assign({}, products[1], { selectedColor: 'Gray', selectedSize: 'L' });

    store.addCartItem(shirt);
    store.addCartItem(jacket);
    store.addWishlistItem(products[2]);
    store.recordRecentlyViewed(products[3]);
    store.toggleComparison(products[4]);

    var order = store.createOrder({
      customer: {
        address: '123 Test Street',
        city: 'Sydney',
        email: 'shopper@example.com',
        name: 'Test Shopper',
        postcode: '2000'
      },
      items: store.state.cart,
      paymentMethod: 'paypal'
    });

    saveStorefrontState(store.state, storage);
    var restoredStore = createStorefrontStore(readStorefrontState(storage));

    expect(order).toMatchObject({ paymentMethod: 'paypal', total: shirt.price * 2 + jacket.price });
    expect(restoredStore.state.cart).toEqual([
      expect.objectContaining({
        id: shirt.id,
        quantity: 2,
        selectedColor: 'Black',
        selectedSize: 'M'
      }),
      expect.objectContaining({
        id: jacket.id,
        quantity: 1,
        selectedColor: 'Gray',
        selectedSize: 'L'
      })
    ]);
    expect(restoredStore.state.wishlist).toEqual([expect.objectContaining({ id: products[2].id })]);
    expect(restoredStore.state.recentlyViewed).toEqual([
      expect.objectContaining({ id: products[3].id })
    ]);
    expect(restoredStore.state.comparison).toEqual([
      expect.objectContaining({ id: products[4].id })
    ]);
    expect(restoredStore.state.orders).toHaveLength(1);
  });

  it('keeps persisted values isolated from later in-memory changes', function () {
    var storage = createMemoryStorage();
    var store = createStorefrontStore();

    store.addCartItem(products[0]);
    saveStorefrontState(store.state, storage);
    store.clearCart();

    expect(readStorefrontState(storage).cart).toHaveLength(1);
    expect(store.state.cart).toEqual([]);
  });
});
