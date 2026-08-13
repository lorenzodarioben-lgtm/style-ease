import { describe, expect, it, vi } from 'vitest';
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
      comparison: [],
      searchQuery: '',
      sortBy: 'featured',
      $route: { query: {} },
      $router: { replace: vi.fn() },
      resetPageAndSync: ProductsPage.methods.resetPageAndSync,
      syncRoute: ProductsPage.methods.syncRoute
    },
    overrides
  );
}

describe('products page options', function () {
  it('restores supported catalogue filters and canonicalizes an out-of-range page', function () {
    var context = createProductsContext({ $route: { query: { category: 'Jeans', page: '2' } } });

    ProductsPage.methods.applyRouteState.call(context);

    expect(context.filters.category).toEqual(['Jeans']);
    expect(context.currentPage).toBe(1);
    expect(context.$router.replace).toHaveBeenCalledWith({
      path: '/products',
      query: { category: 'Jeans' }
    });
  });

  it('writes filter changes back to the route query', function () {
    var context = createProductsContext();

    ProductsPage.methods.toggleCategoryFilter.call(context, 'Jeans');

    expect(context.filters.category).toEqual(['Jeans']);
    expect(context.$router.replace).toHaveBeenCalledWith({
      path: '/products',
      query: { category: 'Jeans' }
    });
  });

  it('persists the in-stock filter and resets its pagination', function () {
    var context = createProductsContext();

    ProductsPage.methods.toggleInStockFilter.call(context);

    expect(context.filters.inStock).toBe(true);
    expect(context.currentPage).toBe(1);
    expect(context.$router.replace).toHaveBeenCalledWith({
      path: '/products',
      query: { inStock: '1' }
    });
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

  it('describes the current pagination position and page button state', function () {
    expect(
      ProductsPage.computed.paginationStatus.call({
        currentPage: 2,
        processedProducts: [products[0]],
        totalPages: 4
      })
    ).toBe('Page 2 of 4.');
    expect(
      ProductsPage.computed.paginationStatus.call({
        currentPage: 1,
        processedProducts: [],
        totalPages: 0
      })
    ).toBe('No matching styles.');
    expect(ProductsPage.methods.paginationButtonLabel.call({ currentPage: 2 }, 2)).toBe(
      'Page 2, current page'
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

  it('moves focus into an opened filter panel', function () {
    var focus = vi.fn();
    var context = {
      $nextTick: function (callback) {
        callback();
      },
      $refs: { 'filter-option-category': { focus: focus } },
      activeFilterDropdown: null,
      focusFirstFilterOption: ProductsPage.methods.focusFirstFilterOption
    };

    ProductsPage.methods.toggleFilterDropdown.call(context, 'category');

    expect(context.activeFilterDropdown).toBe('category');
    expect(focus).toHaveBeenCalledOnce();
    expect(ProductsPage.methods.filterOptionRef('size', 0)).toBe('filter-option-size');
    expect(ProductsPage.methods.filterOptionRef('size', 1)).toBeNull();
  });

  it('uses ordered headings when a filter panel is expanded', function () {
    expect(ProductsPage.template).toContain('<h2>Category</h2>');
    expect(ProductsPage.template).not.toContain('<h3>Category</h3>');
  });

  it('uses card headings that follow the catalogue page heading', function () {
    expect(ProductsPage.template).toContain('<h2 class="product-name">');
  });

  it('closes an open filter when the user clicks outside the filter bar', function () {
    var context = createProductsContext({
      activeFilterDropdown: 'size',
      $refs: {
        filterBar: {
          contains: vi.fn(function () {
            return false;
          })
        }
      },
      closeFilterDropdown: vi.fn()
    });

    ProductsPage.methods.handleDocumentClick.call(context, { target: {} });

    expect(context.closeFilterDropdown).toHaveBeenCalledOnce();
  });

  it('reports active filter values through production state', function () {
    var context = createProductsContext({
      filters: {
        size: ['M'],
        color: [],
        category: ['Jackets'],
        inStock: false,
        priceRange: null
      }
    });

    expect(ProductsPage.methods.isFilterValueActive.call(context, 'size', 'M')).toBe(true);
    expect(ProductsPage.methods.isFilterValueActive.call(context, 'category', 'Shoes')).toBe(false);
  });

  it('resets pagination when the selected sort changes', function () {
    var context = createProductsContext({ sortBy: 'featured' });

    ProductsPage.methods.setSort.call(context, 'price-asc');

    expect(context.sortBy).toBe('price-asc');
    expect(context.currentPage).toBe(1);
  });

  it('reports comparison membership through production component state', function () {
    expect(ProductsPage.methods.isCompared.call({ comparison: [products[0]] }, products[0])).toBe(
      true
    );
    expect(ProductsPage.methods.isCompared.call({ comparison: [] }, products[0])).toBe(false);
  });

  it('opens quick shop with a standalone product copy', function () {
    var trigger = { focus: vi.fn() };
    var context = { quickShopProduct: null, quickShopTrigger: null };

    ProductsPage.methods.openQuickShop.call(context, products[0], { currentTarget: trigger });

    expect(context.quickShopProduct).toEqual(products[0]);
    expect(context.quickShopProduct).not.toBe(products[0]);
    expect(context.quickShopTrigger).toBe(trigger);
    expect(ProductsPage.template).toContain('<quick-shop');
  });

  it('returns focus to the quick-shop trigger after closing the dialog', function () {
    var focus = vi.fn();
    var context = {
      $nextTick: function (callback) {
        callback();
      },
      quickShopProduct: products[0],
      quickShopTrigger: { focus: focus }
    };

    ProductsPage.methods.closeQuickShop.call(context);

    expect(context.quickShopProduct).toBeNull();
    expect(context.quickShopTrigger).toBeNull();
    expect(focus).toHaveBeenCalledOnce();
    expect(ProductsPage.template).toContain('@close="closeQuickShop"');
  });
});
