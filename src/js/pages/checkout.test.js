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
      focusPanel: vi.fn(),
      $emit: vi.fn()
    },
    overrides
  );
}

describe('checkout page options', function () {
  it('calculates checkout totals through production component logic', function () {
    expect(CheckoutPage.computed.totalPrice.call({ cart: [{ price: 75, quantity: 2 }] })).toBe(150);
  });

  it('includes selected product variants in the order summary', function () {
    expect(
      CheckoutPage.methods.orderItemDescription({
        name: 'T-Shirt',
        price: 75,
        quantity: 2,
        selectedColor: 'Black',
        selectedSize: 'M'
      })
    ).toBe('2 × T-Shirt (Size M, Colour Black) — $150.00');
    expect(CheckoutPage.template).toContain('{{ orderItemDescription(item) }}');
  });

  it('summarizes delivery details before a shopper confirms the demo order', function () {
    expect(
      CheckoutPage.computed.deliveryAddress.call({
        address: '1 Test Street',
        city: 'Sydney',
        postcode: '2000'
      })
    ).toBe('1 Test Street, Sydney, 2000');
    expect(CheckoutPage.template).toContain('id="delivery-review-title"');
    expect(CheckoutPage.template).toContain('Edit shipping details');
  });

  it('uses the newest saved order as the confirmation receipt', function () {
    expect(CheckoutPage.computed.latestOrder.call({ orders: [] })).toBeNull();
    expect(
      CheckoutPage.computed.latestOrder.call({ orders: [{ id: 'DEMO-NEW' }, { id: 'DEMO-OLD' }] })
    ).toEqual({ id: 'DEMO-NEW' });
  });

  it('links a confirmation to the selected saved receipt', function () {
    expect(CheckoutPage.template).toContain('query: { receipt: latestOrder.id }');
  });

  it('keeps the delivery-progress status in sync with checkout steps', function () {
    expect(CheckoutPage.template).toContain('<delivery-progress :current-step="step + 1"');
  });

  it('keeps shoppers on shipping when required fields are invalid', function () {
    var context = createCheckoutContext();
    context.getShippingErrors = CheckoutPage.methods.getShippingErrors;
    context.focusFirstError = vi.fn();

    expect(CheckoutPage.methods.goToPayment.call(context)).toBe(false);
    expect(context.step).toBe(1);
    expect(context.fieldErrors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String)
    });
    expect(context.validationError).toBe('Please fix the highlighted shipping details.');
    expect(context.focusFirstError).toHaveBeenCalledOnce();
  });

  it('focuses the first invalid field and clears an error after input', function () {
    var focus = vi.fn();
    var context = createCheckoutContext({
      $nextTick: function (callback) {
        callback();
      },
      $refs: { email: { focus: focus } },
      fieldErrors: { email: 'Enter a valid email address.', name: 'Enter your full name.' }
    });

    CheckoutPage.methods.focusFirstError.call(context);
    CheckoutPage.methods.clearFieldError.call(context, 'email');

    expect(focus).toHaveBeenCalledOnce();
    expect(context.fieldErrors).toEqual({ name: 'Enter your full name.' });
  });

  it('focuses a newly revealed checkout panel', function () {
    var focus = vi.fn();
    var context = createCheckoutContext({
      $nextTick: function (callback) {
        callback();
      },
      $refs: { reviewHeading: { focus: focus } }
    });

    CheckoutPage.methods.focusPanel.call(context, 'reviewHeading');

    expect(focus).toHaveBeenCalledOnce();
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
    expect(context.focusPanel).toHaveBeenCalledWith('reviewHeading');
    CheckoutPage.methods.returnToShipping.call(context);
    expect(context.step).toBe(1);
    expect(context.focusPanel).toHaveBeenLastCalledWith('name');
  });

  it('does not confirm an empty bag and emits a valid demo order', function () {
    var emptyContext = createCheckoutContext({ cart: [] });
    var orderContext = createCheckoutContext();

    expect(CheckoutPage.methods.placeOrder.call(emptyContext)).toBe(false);
    expect(CheckoutPage.methods.placeOrder.call(orderContext)).toBe(true);
    expect(orderContext.orderPlaced).toBe(true);
    expect(orderContext.focusPanel).toHaveBeenCalledWith('confirmationHeading');
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
