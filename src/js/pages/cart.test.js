import { describe, expect, it } from 'vitest';
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
});
