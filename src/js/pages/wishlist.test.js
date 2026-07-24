import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import WishlistPage from './wishlist.js';

describe('wishlist page actions', function () {
  it('formats prices and emits move and remove actions', function () {
    var emit = vi.fn();
    var context = { $emit: emit };

    expect(WishlistPage.methods.formatPrice(75)).toBe('$75.00');
    WishlistPage.methods.moveToBag.call(context, products[0]);
    WishlistPage.methods.removeFromWishlist.call(context, products[0].id);

    expect(emit).toHaveBeenNthCalledWith(1, 'add-to-cart', products[0]);
    expect(emit).toHaveBeenNthCalledWith(2, 'remove-from-wishlist', products[0].id);
  });
});
