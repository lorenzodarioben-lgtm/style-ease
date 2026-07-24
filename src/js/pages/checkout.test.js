import { describe, expect, it, vi } from 'vitest';
import CheckoutPage from './checkout.js';

function createCheckoutContext(overrides) {
  return Object.assign(
    {
      address: '',
      city: '',
      email: '',
      fieldErrors: {},
      name: '',
      orderPlaced: false,
      postcode: '',
      step: 1,
      validationError: '',
      cart: [{ id: 1, name: 'T-Shirt', price: 75, quantity: 2 }],
      $emit: vi.fn()
    },
    overrides
  );
}

describe('checkout page options', function () {
  it('calculates checkout totals through production component logic', function () {
    expect(CheckoutPage.computed.totalPrice.call({ cart: [{ price: 75, quantity: 2 }] })).toBe(150);
  });

  it('keeps shoppers on shipping when required fields are invalid', function () {
    var context = createCheckoutContext();
    context.getShippingErrors = CheckoutPage.methods.getShippingErrors;

    expect(CheckoutPage.methods.goToPayment.call(context)).toBe(false);
    expect(context.step).toBe(1);
    expect(context.fieldErrors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String)
    });
    expect(context.validationError).toBe('Please fix the highlighted shipping details.');
  });

  it('moves valid shipping details to review and supports returning', function () {
    var context = createCheckoutContext({
      address: '123 Test Street',
      city: 'Sydney',
      email: 'shopper@example.com',
      name: 'Test Shopper',
      postcode: '2000'
    });
    context.getShippingErrors = CheckoutPage.methods.getShippingErrors;

    expect(CheckoutPage.methods.goToPayment.call(context)).toBe(true);
    expect(context.step).toBe(2);
    CheckoutPage.methods.returnToShipping.call(context);
    expect(context.step).toBe(1);
  });

  it('does not confirm an empty bag and emits a valid demo order', function () {
    var emptyContext = createCheckoutContext({ cart: [] });
    var orderContext = createCheckoutContext();

    expect(CheckoutPage.methods.placeOrder.call(emptyContext)).toBe(false);
    expect(CheckoutPage.methods.placeOrder.call(orderContext)).toBe(true);
    expect(orderContext.orderPlaced).toBe(true);
    expect(orderContext.$emit).toHaveBeenCalledWith(
      'complete-order',
      expect.objectContaining({
        customer: expect.objectContaining({ name: '' }),
        items: orderContext.cart,
        paymentMethod: undefined
      })
    );
  });
});
