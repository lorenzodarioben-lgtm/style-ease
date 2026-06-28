import { describe, expect, it, vi } from 'vitest';
import { filterOptions, products } from '../data/catalog.js';
import {
  calculateCartTotal,
  cloneProduct,
  createEmptyFilters,
  createSelectedCartItem,
  filterProducts,
  findProductById,
  formatPrice,
  getDefaultSize,
  normalizeSearchQuery,
  productMatchesFilters,
  productMatchesSearch,
  readReviews,
  saveReviews,
  toggleListValue,
  truncateText
} from './catalog-utils.js';

function createStorage(initialValues) {
  var values = Object.assign({}, initialValues);

  return {
    getItem: vi.fn(function (key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    }),
    setItem: vi.fn(function (key, value) {
      values[key] = String(value);
    }),
    values: values
  };
}

describe('catalog utilities', function () {
  it('clones products and adds selected cart options without mutating the source product', function () {
    var product = products[0];
    var clone = cloneProduct(product);
    var selectedItem = createSelectedCartItem(product, 'M', 'Black');

    expect(clone).toEqual(product);
    expect(clone).not.toBe(product);
    expect(selectedItem).toMatchObject({
      id: product.id,
      selectedSize: 'M',
      selectedColor: 'Black'
    });
    expect(product.selectedSize).toBeUndefined();
  });

  it('creates independent empty filter objects', function () {
    var firstFilters = createEmptyFilters();
    var secondFilters = createEmptyFilters();

    firstFilters.category.push('T-Shirts');

    expect(secondFilters.category).toEqual([]);
  });

  it('finds products by id and returns undefined for unknown ids', function () {
    expect(findProductById(1).name).toBe('Geometric T-Shirt');
    expect(findProductById(9999)).toBeUndefined();
  });

  it('chooses a sensible default size', function () {
    expect(getDefaultSize({ sizes: ['S', 'M', 'L'] })).toBe('M');
    expect(getDefaultSize({ sizes: ['One Size'] })).toBe('One Size');
    expect(getDefaultSize({ sizes: [] })).toBe('');
    expect(getDefaultSize(null)).toBe('');
  });

  it('normalizes search queries', function () {
    expect(normalizeSearchQuery('  SHIRT  ')).toBe('shirt');
    expect(normalizeSearchQuery('')).toBe('');
    expect(normalizeSearchQuery(null)).toBe('');
  });

  it('matches product search against names and descriptions', function () {
    expect(productMatchesSearch(products[0], 'geometric')).toBe(true);
    expect(productMatchesSearch(products[0], 'bold patterns')).toBe(true);
    expect(productMatchesSearch(products[0], 'no-such-product')).toBe(false);
    expect(productMatchesSearch(null, 'shirt')).toBe(false);
  });

  it('filters products by search, category, size, color, and price', function () {
    var shirtResults = filterProducts(products, 'shirt', createEmptyFilters());
    var categoryFilters = createEmptyFilters();
    var priceFilters = createEmptyFilters();
    var sizeColorFilters = createEmptyFilters();

    categoryFilters.category = ['Jeans'];
    priceFilters.priceRange = filterOptions.priceRanges[2];
    sizeColorFilters.size = ['One Size'];
    sizeColorFilters.color = ['Red'];

    expect(
      shirtResults.map(function (product) {
        return product.name;
      })
    ).toEqual(['Geometric T-Shirt', 'Axis Dress Shirt']);
    expect(
      filterProducts(products, '', categoryFilters).every(function (product) {
        return product.category === 'Jeans';
      })
    ).toBe(true);
    expect(
      filterProducts(products, '', priceFilters).every(function (product) {
        return product.price > 100;
      })
    ).toBe(true);
    expect(
      filterProducts(products, '', sizeColorFilters).every(function (product) {
        return product.sizes.indexOf('One Size') > -1 && product.colors.indexOf('Red') > -1;
      })
    ).toBe(true);
    expect(filterProducts(products, 'zzzzzz', createEmptyFilters())).toEqual([]);
    expect(filterProducts(null, '', createEmptyFilters())).toEqual([]);
  });

  it('handles malformed filters without matching invalid products', function () {
    expect(productMatchesFilters(products[0], { size: null, color: null, category: null })).toBe(
      true
    );
    expect(productMatchesFilters(null, createEmptyFilters())).toBe(false);
  });

  it('formats prices and calculates cart totals safely', function () {
    expect(formatPrice(75)).toBe('$75.00');
    expect(formatPrice('12.5')).toBe('$12.50');
    expect(formatPrice('not-a-price')).toBe('$0.00');
    expect(calculateCartTotal([{ price: 10 }, { price: '5.5' }, { price: null }])).toBe(15.5);
    expect(calculateCartTotal([])).toBe(0);
    expect(calculateCartTotal(null)).toBe(0);
  });

  it('toggles list values in place', function () {
    var selected = ['S'];

    toggleListValue(selected, 'M');
    expect(selected).toEqual(['S', 'M']);

    toggleListValue(selected, 'S');
    expect(selected).toEqual(['M']);
  });

  it('truncates text safely', function () {
    expect(truncateText('Geometric T-Shirt', 9)).toBe('Geometric...');
    expect(truncateText('Short', 20)).toBe('Short');
    expect(truncateText(null, 20)).toBe('');
    expect(truncateText('Hidden', 0)).toBe('');
  });

  it('reads and saves reviews through storage', function () {
    var storage = createStorage({
      'reviews-product-1': JSON.stringify([
        { rating: 5, comment: 'Great' },
        { rating: Number.NaN, comment: 'Invalid' },
        null
      ])
    });

    expect(readReviews(1, storage)).toEqual([{ rating: 5, comment: 'Great' }]);

    saveReviews(2, [{ rating: 4, comment: 'Nice' }], storage);

    expect(storage.setItem).toHaveBeenCalledWith(
      'reviews-product-2',
      JSON.stringify([{ rating: 4, comment: 'Nice' }])
    );
  });

  it('falls back to empty reviews when storage contains invalid data or throws', function () {
    var malformedStorage = createStorage({ 'reviews-product-1': '{nope' });
    var throwingStorage = {
      getItem: function () {
        throw new Error('blocked');
      },
      setItem: function () {
        throw new Error('blocked');
      }
    };

    expect(readReviews(1, malformedStorage)).toEqual([]);
    expect(readReviews(1, throwingStorage)).toEqual([]);
    expect(function () {
      saveReviews(1, [], throwingStorage);
    }).not.toThrow();
  });
});
