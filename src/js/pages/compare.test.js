import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import ComparePage from './compare.js';

describe('comparison page', function () {
  it('formats comparison values and emits product removal', function () {
    var emit = vi.fn();
    var product = Object.assign({}, products[0], { stock: 2 });

    expect(ComparePage.methods.formatPrice(75)).toBe('$75.00');
    expect(ComparePage.methods.getStockLabel(product)).toBe('2 available');
    ComparePage.methods.removeProduct.call({ $emit: emit }, product);
    expect(emit).toHaveBeenCalledWith('toggle-comparison', product);
  });

  it('provides column headers that identify each compared product', function () {
    expect(ComparePage.template).toContain('<thead>');
    expect(ComparePage.template).toContain('scope="col"');
    expect(ComparePage.template).toContain("'name-' + product.id");
  });
});
