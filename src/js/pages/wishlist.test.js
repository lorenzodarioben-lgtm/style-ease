import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import WishlistPage from './wishlist.js';

describe('wishlist page actions', function () {
  it('formats prices and emits move and remove actions', function () {
    var emit = vi.fn();
    var context = { $emit: emit };
    var selectedProduct = Object.assign({}, products[0], {
      selectedColor: 'Black',
      selectedSize: 'M'
    });

    expect(WishlistPage.methods.formatPrice(75)).toBe('$75.00');
    WishlistPage.methods.moveToBag.call(context, selectedProduct);
    WishlistPage.methods.removeFromWishlist.call(context, selectedProduct);

    expect(emit).toHaveBeenNthCalledWith(1, 'move-wishlist-item-to-cart', selectedProduct);
    expect(emit).toHaveBeenNthCalledWith(2, 'remove-from-wishlist', selectedProduct);
  });

  it('keeps wishlist card identity and labels tied to the selected variant', function () {
    var selectedProduct = Object.assign({}, products[0], {
      selectedColor: 'Black',
      selectedSize: 'M'
    });

    expect(WishlistPage.methods.wishlistItemKey(selectedProduct)).toBe('1:M:Black');
    expect(WishlistPage.methods.variantLabel(selectedProduct)).toBe('M · Black');
    expect(WishlistPage.template).toContain('Saved selection: {{ variantLabel(product) }}');
    expect(WishlistPage.template).toContain("@click=\"removeFromWishlist(product)\"");
  });
});
