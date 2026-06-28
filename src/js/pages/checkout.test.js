import { describe, expect, it, vi } from 'vitest';
import CheckoutPage from './checkout.js';

describe('checkout page options', function () {
  it('calculates checkout totals through production component logic', function () {
    var cart = [{ price: 75 }, { price: '25.5' }, { price: undefined }];

    expect(CheckoutPage.computed.totalPrice.call({ cart: cart })).toBe(100.5);
  });

  it('blocks order submission when required fields are blank', function () {
    var context = {
      name: '  ',
      address: '123 Test Street',
      orderPlaced: false,
      notifyValidationError: CheckoutPage.methods.notifyValidationError,
      validationError: '',
      $emit: vi.fn()
    };

    CheckoutPage.methods.placeOrder.call(context);

    expect(context.validationError).toBe('Please enter your name and shipping address.');
    expect(context.orderPlaced).toBe(false);
    expect(context.$emit).not.toHaveBeenCalled();
  });

  it('places valid orders and clears the cart', function () {
    var context = {
      name: 'Test Shopper',
      address: '123 Test Street',
      orderPlaced: false,
      validationError: 'Previous error',
      notifyValidationError: vi.fn(),
      $emit: vi.fn()
    };

    CheckoutPage.methods.placeOrder.call(context);

    expect(context.notifyValidationError).not.toHaveBeenCalled();
    expect(context.validationError).toBe('');
    expect(context.orderPlaced).toBe(true);
    expect(context.$emit).toHaveBeenCalledWith('clear-cart');
  });
});
