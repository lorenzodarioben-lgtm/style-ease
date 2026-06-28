import { describe, expect, it } from 'vitest';
import { getRouteTitle } from './router.js';

describe('route titles', function () {
  it('returns meaningful titles for primary routes', function () {
    expect(getRouteTitle({ path: '/' })).toBe('Style Ease - Modern Fashion');
    expect(getRouteTitle({ path: '/products', query: {} })).toBe('Product Catalogue - Style Ease');
    expect(getRouteTitle({ path: '/cart' })).toBe('Shopping Cart - Style Ease');
    expect(getRouteTitle({ path: '/checkout' })).toBe('Checkout - Style Ease');
  });

  it('includes category and product context when available', function () {
    expect(getRouteTitle({ path: '/products', query: { category: 'Jackets' } })).toBe(
      'Jackets - Style Ease'
    );
    expect(getRouteTitle({ path: '/product/1', params: { id: '1' } })).toBe(
      'Geometric T-Shirt - Style Ease'
    );
    expect(getRouteTitle({ path: '/product/9999', params: { id: '9999' } })).toBe(
      'Product Not Found - Style Ease'
    );
  });
});
