import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import ComparePage from './compare.js';

describe('comparison page', function () {
  it('formats comparison values and emits product removal', function () {
    var emit = vi.fn();
    var product = Object.assign({}, products[0], { stock: 2 });

    expect(ComparePage.methods.formatPrice(75)).toBe('$75.00');
    expect(ComparePage.methods.getStockLabel(product)).toBe('2 available');
    expect(ComparePage.methods.addToBagLabel(product)).toBe('Add Geometric T-Shirt to bag.');
    expect(ComparePage.methods.addToBagLabel(Object.assign({}, product, { stock: 0 }))).toBe(
      'Geometric T-Shirt is unavailable in this demo.'
    );
    ComparePage.methods.removeProduct.call({ $emit: emit }, product);
    expect(emit).toHaveBeenCalledWith('toggle-comparison', product);
    expect(ComparePage.template).toContain(':aria-label="addToBagLabel(product)"');
  });

  it('provides column headers that identify each compared product', function () {
    expect(ComparePage.template).toContain('<thead>');
    expect(ComparePage.template).toContain('scope="col"');
    expect(ComparePage.template).toContain("'name-' + product.id");
  });

  it('links comparison images and names to the corresponding product detail page', function () {
    expect(ComparePage.template).toContain(':to="\'/product/\' + product.id"');
    expect(ComparePage.template).toContain("'View ' + product.name + ' details'");
    expect(ComparePage.template).toContain('<h2><router-link');
  });
});
