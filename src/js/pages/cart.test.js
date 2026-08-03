import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import CartPage from './cart.js';

describe('cart page options', function () {
  it('calculates an empty cart total as zero', function () {
    expect(CartPage.computed.totalPrice.call({ cart: [] })).toBe(0);
  });

  it('calculates cart totals through production component logic', function () {
    var cart = [{ price: 75, quantity: 2 }, { price: '25.5', quantity: 1 }, { price: undefined }];

    expect(CartPage.computed.totalPrice.call({ cart: cart })).toBe(175.5);
    expect(CartPage.computed.cartItemCount.call({ cart: cart })).toBe(4);
  });

  it('truncates cart item names through production component logic', function () {
    expect(CartPage.methods.truncate('Crest Axio Golden Antique Silmaril Cuff Bracelet', 20)).toBe(
      'Crest Axio Golden An...'
    );
  });

  it('announces normalized quantity and total changes', function () {
    var context = {
      $emit: vi.fn(),
      cart: [Object.assign({}, products[0], { quantity: 1 })],
      cartStatus: '',
      quantityLimit: CartPage.methods.quantityLimit
    };

    CartPage.methods.updateQuantity.call(context, 0, 20);

    expect(context.$emit).toHaveBeenCalledWith('update-cart-quantity', 0, products[0].stock);
    expect(context.cartStatus).toBe('Geometric T-Shirt quantity updated to 8. Cart total $600.00.');
  });

  it('announces the name of a removed cart item', function () {
    var context = {
      $emit: vi.fn(),
      cart: [products[0]],
      cartStatus: ''
    };

    CartPage.methods.removeFromCart.call(context, 0);

    expect(context.$emit).toHaveBeenCalledWith('remove-from-cart', 0);
    expect(context.cartStatus).toBe('Geometric T-Shirt removed from your cart.');
  });

  it('emits a save-for-later action for the selected cart line', function () {
    var context = {
      $emit: vi.fn(),
      cart: [products[0]]
    };

    CartPage.methods.saveForLater.call(context, 0);
    CartPage.methods.saveForLater.call(context, 1);

    expect(context.$emit).toHaveBeenCalledTimes(1);
    expect(context.$emit).toHaveBeenCalledWith('save-cart-item-for-later', 0);
  });
});
