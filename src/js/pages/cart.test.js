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

  it('explains the remaining shared stock capacity for a cart line', function () {
    var product = Object.assign({}, products[0], { stock: 4, quantity: 1 });
    var context = {
      cart: [product, Object.assign({}, product, { selectedColor: 'White', quantity: 2 })],
      quantityLimit: CartPage.methods.quantityLimit
    };

    expect(CartPage.methods.availabilityLabel.call(context, product, 0)).toBe(
      '2 demo items can be held across all selections of this style.'
    );
    expect(CartPage.template).toContain('class="cart-item-availability"');
    expect(CartPage.template).toContain(':aria-describedby="\'cart-availability-\' + index"');
    expect(CartPage.template).toContain('inputmode="numeric"');
  });

  it('announces the name of a removed cart item', function () {
    var context = {
      $emit: vi.fn(),
      cart: [products[0]],
      cartStatus: '',
      focusAfterRemoval: vi.fn()
    };

    CartPage.methods.removeFromCart.call(context, 0);

    expect(context.$emit).toHaveBeenCalledWith('remove-from-cart', 0);
    expect(context.cartStatus).toBe('Geometric T-Shirt removed from your cart.');
    expect(context.focusAfterRemoval).toHaveBeenCalledWith(0);
  });

  it('moves focus to the next removal control after a cart item is removed', function () {
    var focus = vi.fn();
    var context = {
      $nextTick: function (callback) {
        callback();
      },
      $refs: { 'remove-cart-item-0': [{ focus: focus }] },
      cart: [products[1]]
    };

    CartPage.methods.focusAfterRemoval.call(context, 0);

    expect(focus).toHaveBeenCalledOnce();
    expect(CartPage.template).toContain(':ref="\'remove-cart-item-\' + index"');
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

  it('shows delivery progress before a shopper checks out', function () {
    expect(CartPage.template).toContain('<delivery-progress :current-step="1"');
  });

  it('links each cart line back to an appropriately ordered product detail heading', function () {
    expect(CartPage.template).toContain(':to="\'/product/\' + item.id"');
    expect(CartPage.template).toContain('<h2><router-link');
    expect(CartPage.template).not.toContain('<h3>{{ truncate(item.name, 20) }}</h3>');
  });
});
