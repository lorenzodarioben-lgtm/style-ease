import { describe, expect, it } from 'vitest';
import { products } from '../data/catalog.js';
import { createEmptyFilters } from '../utils/catalog-utils.js';
import ProductsPage from './products.js';

function createProductsContext(overrides) {
  return Object.assign(
    {
      currentPage: 2,
      filterOptions: ProductsPage.data().filterOptions,
      filters: createEmptyFilters(),
      itemsPerPage: 6,
      searchQuery: ''
    },
    overrides
  );
}

describe('products page options', function () {
  it('applies a valid route category filter and resets pagination', function () {
    var context = createProductsContext();

    ProductsPage.methods.applyCategoryFromRoute.call(context, 'Jeans');

    expect(context.filters.category).toEqual(['Jeans']);
    expect(context.currentPage).toBe(1);
  });

  it('ignores unknown route category filters', function () {
    var context = createProductsContext();

    ProductsPage.methods.applyCategoryFromRoute.call(context, 'Unknown');

    expect(context.filters.category).toEqual([]);
    expect(context.currentPage).toBe(2);
  });

  it('filters processed products using the production computed property', function () {
    var context = createProductsContext({
      searchQuery: 'shirt'
    });

    var result = ProductsPage.computed.processedProducts.call(context);

    expect(
      result.map(function (product) {
        return product.name;
      })
    ).toEqual(['Geometric T-Shirt', 'Axis Dress Shirt']);
  });

  it('explains no-results state when search is active', function () {
    expect(ProductsPage.computed.noResultsMessage.call({ searchQuery: '' })).toBe(
      'No products match your selected filters'
    );
    expect(ProductsPage.computed.noResultsMessage.call({ searchQuery: 'shirt' })).toBe(
      'No products match your search or selected filters'
    );
  });

  it('paginates processed products without mutating the catalogue', function () {
    var context = createProductsContext({
      currentPage: 2,
      processedProducts: products
    });

    var result = ProductsPage.computed.paginatedProducts.call(context);

    expect(result).toEqual(products.slice(6, 12));
    expect(products).toHaveLength(20);
  });

  it('describes filter button state for assistive technology', function () {
    expect(ProductsPage.methods.filterButtonLabel('Category filter', 0)).toBe('Category filter');
    expect(ProductsPage.methods.filterButtonLabel('Category filter', 2)).toBe(
      'Category filter, 2 selected'
    );
  });

  it('reports active filter values through production state', function () {
    var context = createProductsContext({
      filters: {
        size: ['M'],
        color: [],
        category: ['Jackets'],
        priceRange: null
      }
    });

    expect(ProductsPage.methods.isFilterValueActive.call(context, 'size', 'M')).toBe(true);
    expect(ProductsPage.methods.isFilterValueActive.call(context, 'category', 'Shoes')).toBe(false);
  });
});
