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
});
