import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import { createStorefrontStore } from './storefront.js';

describe('storefront store', function () {
  it('centralizes cart and wishlist mutations without mutating catalogue data', function () {
    var store = createStorefrontStore();

    expect(store.addCartItem(products[0])).toBe(true);
    expect(store.addWishlistItem(products[0])).toBe(true);
    expect(store.addWishlistItem(products[0])).toBe(false);

    expect(store.state.cart).toHaveLength(1);
    expect(store.state.wishlist).toHaveLength(1);
    expect(store.state.cart[0]).not.toBe(products[0]);
    expect(store.state.wishlist[0]).not.toBe(products[0]);
  });

  it('guards invalid cart mutations and preserves reactive search state', function () {
    var store = createStorefrontStore({ searchInput: '  jacket  ' });

    expect(store.addCartItem(null)).toBe(false);
    expect(store.removeCartItem(0)).toBe(false);

    store.setSearchQuery(store.state.searchInput);
    store.setSearchInput(null);

    expect(store.state.searchQuery).toBe('jacket');
    expect(store.state.searchInput).toBe('');
  });

  it('notifies subscribers after state changes', function () {
    var store = createStorefrontStore();
    var notify = vi.fn();

    store.subscribe(notify);
    store.addCartItem(products[0]);

    expect(notify).toHaveBeenCalledWith(store.state);
  });

  it('merges matching variants and updates their quantities', function () {
    var store = createStorefrontStore();

    store.addCartItem(
      Object.assign({}, products[0], { selectedSize: 'M', selectedColor: 'Black' })
    );
    store.addCartItem(
      Object.assign({}, products[0], { selectedSize: 'M', selectedColor: 'Black', quantity: 2 })
    );
    store.addCartItem(
      Object.assign({}, products[0], { selectedSize: 'L', selectedColor: 'Black' })
    );

    expect(store.state.cart).toHaveLength(2);
    expect(store.state.cart[0].quantity).toBe(3);
    expect(store.setCartItemQuantity(0, 5)).toBe(true);
    expect(store.state.cart[0].quantity).toBe(5);
  });

  it('caps additions and quantity updates at the product stock level', function () {
    var lowStockProduct = Object.assign({}, products[0], { stock: 3 });
    var store = createStorefrontStore();

    store.addCartItem(Object.assign({}, lowStockProduct, { quantity: 2 }));
    store.addCartItem(Object.assign({}, lowStockProduct, { selectedSize: 'L', quantity: 3 }));

    expect(store.state.cart).toHaveLength(2);
    expect(store.state.cart[1].quantity).toBe(1);
    expect(store.getCartItemQuantityLimit(0)).toBe(2);
    store.setCartItemQuantity(0, 8);
    expect(store.state.cart[0].quantity).toBe(2);
    expect(store.addCartItem(lowStockProduct)).toBe(false);
  });

  it('caps restored cart quantities before exposing the state', function () {
    var lowStockProduct = Object.assign({}, products[0], { stock: 3, quantity: 8 });
    var store = createStorefrontStore({
      cart: [
        lowStockProduct,
        Object.assign({}, lowStockProduct, { selectedSize: 'L', quantity: 2 })
      ]
    });

    expect(store.state.cart).toHaveLength(1);
    expect(store.state.cart[0].quantity).toBe(3);
  });

  it('keeps a de-duplicated, capped recently viewed history', function () {
    var store = createStorefrontStore();

    products.slice(0, 7).forEach(function (product) {
      store.recordRecentlyViewed(product);
    });
    store.recordRecentlyViewed(products[2]);

    expect(store.state.recentlyViewed).toHaveLength(6);
    expect(store.state.recentlyViewed[0].id).toBe(products[2].id);
    expect(
      store.state.recentlyViewed.filter(function (item) {
        return item.id === products[2].id;
      })
    ).toHaveLength(1);
  });

  it('allows a compact comparison set and removes selected products', function () {
    var store = createStorefrontStore();

    products.slice(0, 3).forEach(function (product) {
      expect(store.toggleComparison(product)).toBe(true);
    });

    expect(store.toggleComparison(products[3])).toBe(false);
    expect(store.toggleComparison(products[1])).toBe(true);
    expect(
      store.state.comparison.map(function (item) {
        return item.id;
      })
    ).toEqual([1, 3]);
  });

  it('creates local receipt data from a completed demo checkout', function () {
    var store = createStorefrontStore();
    var order = store.createOrder({
      customer: { name: 'Test Shopper' },
      items: [Object.assign({}, products[0], { quantity: 2 })],
      paymentMethod: 'paypal'
    });

    expect(order).toMatchObject({ paymentMethod: 'paypal', total: 150 });
    expect(order.id).toMatch(/^DEMO-/);
    expect(store.state.orders).toHaveLength(1);
  });
});
