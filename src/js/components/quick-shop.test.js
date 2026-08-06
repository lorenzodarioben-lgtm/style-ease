import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import QuickShop from './quick-shop.js';

describe('quick shop', function () {
  it('adds the selected product variant and closes the dialog', function () {
    var emit = vi.fn();
    var context = {
      $emit: emit,
      availableStock: 3,
      product: products[0],
      selectedColor: 'Black',
      selectedQuantity: 2,
      selectedSize: 'M',
      close: QuickShop.methods.close
    };

    QuickShop.methods.handleAddToCart.call(context);

    expect(emit).toHaveBeenCalledWith(
      'add-to-cart',
      expect.objectContaining({
        id: products[0].id,
        quantity: 2,
        selectedColor: 'Black',
        selectedSize: 'M'
      })
    );
    expect(emit).toHaveBeenCalledWith('close');
  });

  it('reports stock remaining after cart reservations', function () {
    var product = Object.assign({}, products[0], { stock: 3 });

    expect(
      QuickShop.computed.availableStock.call({
        cart: [Object.assign({}, product, { quantity: 2 })],
        product: product
      })
    ).toBe(1);
  });
});
