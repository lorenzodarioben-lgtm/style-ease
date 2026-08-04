import { describe, expect, it, vi } from 'vitest';
import { filterOptions, products } from '../data/catalog.js';
import {
  calculateCartTotal,
  calculateCartQuantity,
  clearReviews,
  cloneProduct,
  createCartItem,
  createEmptyFilters,
  createSelectedCartItem,
  filterProducts,
  findProductById,
  formatPrice,
  getDefaultSize,
  getCartItemVariantKey,
  getCartProductQuantity,
  getProductStock,
  getReviewSummary,
  normalizeSearchQuery,
  parseProductId,
  productMatchesFilters,
  productMatchesSearch,
  readReviews,
  saveReviews,
  sortReviews,
  sortProducts,
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
    removeItem: vi.fn(function (key) {
      delete values[key];
    }),
    values: values
  };
}

describe('catalog utilities', function () {
  it('derives filters from every product option', function () {
    expect(filterOptions.sizes).toEqual(
      expect.arrayContaining(['XXL', '28', '38', 'One Size', 'Standard'])
    );
    expect(filterOptions.colors).toEqual(
      expect.arrayContaining(['Black', 'White', 'Gray', 'Blue', 'Red'])
    );
  });

  it('uses a consistent category taxonomy for topwear and outerwear', function () {
    expect(products[0].category).toBe('Tops');
    expect(products[6].category).toBe('Jackets');
    expect(products[7].category).toBe('Tops');
    expect(products[19].category).toBe('Tops');
  });

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

  it('normalizes cart variants, quantities, and item keys', function () {
    var item = createCartItem(products[0], 'M', 'Black', 3);

    expect(item).toMatchObject({ selectedSize: 'M', selectedColor: 'Black', quantity: 3 });
    expect(createCartItem(products[0], 'Unknown', 'Purple', 0)).toMatchObject({
      selectedSize: 'M',
      selectedColor: 'Black',
      quantity: 1
    });
    expect(getCartItemVariantKey(item)).toBe('1:M:Black');
    expect(getCartProductQuantity([item, Object.assign({}, item, { quantity: 2 })], 1)).toBe(5);
    expect(getProductStock(Object.assign({}, products[0], { stock: 4 }))).toBe(4);
    expect(getProductStock({ stock: -1 })).toBe(0);
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

  it('accepts only canonical positive product identifiers', function () {
    expect(parseProductId('1')).toBe(1);
    expect(parseProductId(2)).toBe(2);
    expect(parseProductId('1abc')).toBeNull();
    expect(parseProductId('01')).toBeNull();
    expect(parseProductId(0)).toBeNull();
  });

  it('matches product search against product attributes with normalized terms', function () {
    expect(productMatchesSearch(products[0], 'geometric')).toBe(true);
    expect(productMatchesSearch(products[0], 'bold patterns')).toBe(true);
    expect(productMatchesSearch(products[1], '  BLACK   WOOL ')).toBe(true);
    expect(productMatchesSearch(products[1], 'jacket')).toBe(true);
    expect(productMatchesSearch(products[3], 'leather')).toBe(true);
    expect(productMatchesSearch(products[1], 'M')).toBe(true);
    expect(productMatchesSearch(products[0], 'no-such-product')).toBe(false);
    expect(productMatchesSearch({ name: 'Minimal' }, 'black')).toBe(false);
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

  it('filters static demo stock without treating cart reservations as unavailable', function () {
    var filters = createEmptyFilters();

    filters.inStock = true;
    expect(filterProducts(products, '', filters)).toHaveLength(products.length - 1);
    expect(productMatchesFilters(products[9], filters)).toBe(false);
    expect(productMatchesFilters(products[0], filters)).toBe(true);
  });

  it('sorts a copy of products by storefront controls', function () {
    var list = [
      { id: 1, name: 'Zulu', price: 40, rating: 4.3, releasedAt: '2026-01-01' },
      { id: 2, name: 'Alpha', price: 10, rating: 4.8, releasedAt: '2026-01-03' }
    ];

    expect(
      sortProducts(list, 'price-asc').map(function (item) {
        return item.id;
      })
    ).toEqual([2, 1]);
    expect(
      sortProducts(list, 'rating').map(function (item) {
        return item.id;
      })
    ).toEqual([2, 1]);
    expect(
      sortProducts(list, 'name').map(function (item) {
        return item.id;
      })
    ).toEqual([2, 1]);
    expect(
      sortProducts(list, 'newest').map(function (item) {
        return item.id;
      })
    ).toEqual([2, 1]);
    expect(list[0].id).toBe(1);
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
    expect(
      calculateCartTotal([{ price: 10, quantity: 2 }, { price: '5.5' }, { price: null }])
    ).toBe(25.5);
    expect(calculateCartTotal([])).toBe(0);
    expect(calculateCartTotal(null)).toBe(0);
    expect(calculateCartQuantity([{ quantity: 3 }, { quantity: 0 }, {}])).toBe(5);
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

  it('sanitizes persisted reviews and limits their retained count', function () {
    var storage = createStorage({
      'reviews-product-1': JSON.stringify([
        { rating: 5, comment: '  Great  ' },
        { rating: 0, comment: 'Invalid' },
        { rating: 3.5, comment: 'Invalid' },
        { rating: 6, comment: 'Invalid' },
        { rating: 4, comment: 42 }
      ])
    });
    var manyReviews = Array.from({ length: 55 }, function (_, index) {
      return { rating: 5, comment: 'Review ' + index };
    });

    expect(readReviews(1, storage)).toEqual([
      { rating: 5, comment: 'Great' },
      { rating: 4, comment: '' }
    ]);
    expect(saveReviews(1, manyReviews, storage)).toHaveLength(50);
    expect(JSON.parse(storage.values['reviews-product-1'])).toHaveLength(50);
  });

  it('preserves legacy reviews and validates timestamps for local review summaries', function () {
    var storage = createStorage({
      'reviews-product-1': JSON.stringify([
        { rating: 5, comment: 'New', createdAt: '2026-08-04T10:00:00.000Z' },
        { rating: 3, comment: 'Legacy' },
        { rating: 4, comment: 'Invalid timestamp', createdAt: 'not-a-date' }
      ])
    });
    var reviews = readReviews(1, storage);

    expect(reviews).toEqual([
      { rating: 5, comment: 'New', createdAt: '2026-08-04T10:00:00.000Z' },
      { rating: 3, comment: 'Legacy' },
      { rating: 4, comment: 'Invalid timestamp' }
    ]);
    expect(getReviewSummary(reviews)).toEqual({ average: 4, count: 3 });
  });

  it('orders reviews by newest timestamp or highest rating without exceeding the local cap', function () {
    var reviews = [
      { rating: 3, comment: 'Legacy' },
      { rating: 5, comment: 'Earlier', createdAt: '2026-08-03T10:00:00.000Z' },
      { rating: 4, comment: 'Latest', createdAt: '2026-08-04T10:00:00.000Z' }
    ];

    expect(
      sortReviews(reviews, 'newest').map(function (review) {
        return review.comment;
      })
    ).toEqual(['Latest', 'Earlier', 'Legacy']);
    expect(
      sortReviews(reviews, 'highest-rating').map(function (review) {
        return review.comment;
      })
    ).toEqual(['Earlier', 'Latest', 'Legacy']);
  });

  it('removes reviews for every catalogue product without clearing other storage', function () {
    var storage = createStorage({
      'reviews-product-1': JSON.stringify([{ rating: 5, comment: 'Great' }]),
      unrelated: 'keep'
    });

    expect(clearReviews(storage)).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledTimes(products.length);
    expect(storage.values.unrelated).toBe('keep');
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
