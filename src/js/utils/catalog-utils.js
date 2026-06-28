import { products } from '../data/catalog.js';

const REVIEW_STORAGE_PREFIX = 'reviews-product-';
const DEFAULT_TRUNCATE_LENGTH = 20;

export function calculateCartTotal(cart) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  return cart.reduce(function (total, item) {
    var price = Number(item && item.price);

    return Number.isFinite(price) ? total + price : total;
  }, 0);
}

export function cloneProduct(product) {
  return Object.assign({}, product);
}

export function createEmptyFilters() {
  return {
    size: [],
    color: [],
    category: [],
    priceRange: null
  };
}

export function createEmptyReview() {
  return {
    rating: 0,
    comment: ''
  };
}

function createReviewStorageKey(productId) {
  return REVIEW_STORAGE_PREFIX + productId;
}

export function createSelectedCartItem(product, selectedSize, selectedColor) {
  return Object.assign(cloneProduct(product), {
    selectedSize: selectedSize,
    selectedColor: selectedColor
  });
}

export function filterProducts(productList, searchQuery, filters) {
  if (!Array.isArray(productList)) {
    return [];
  }

  var normalizedQuery = normalizeSearchQuery(searchQuery);
  var activeFilters = filters || createEmptyFilters();

  return productList.filter(function (product) {
    return (
      productMatchesSearch(product, normalizedQuery) &&
      productMatchesFilters(product, activeFilters)
    );
  });
}

export function findProductById(productId) {
  return products.find(function (product) {
    return product.id === productId;
  });
}

export function formatPrice(price) {
  var amount = Number(price);

  return '$' + (Number.isFinite(amount) ? amount : 0).toFixed(2);
}

export function getDefaultSize(product) {
  if (!product || !product.sizes.length) {
    return '';
  }

  return product.sizes.indexOf('M') > -1 ? 'M' : product.sizes[0];
}

export function normalizeSearchQuery(searchQuery) {
  return typeof searchQuery === 'string' ? searchQuery.trim().toLowerCase() : '';
}

export function productMatchesFilters(product, filters) {
  if (!product) {
    return false;
  }

  var activeFilters = filters || createEmptyFilters();
  var selectedSizes = Array.isArray(activeFilters.size) ? activeFilters.size : [];
  var selectedColors = Array.isArray(activeFilters.color) ? activeFilters.color : [];
  var selectedCategories = Array.isArray(activeFilters.category) ? activeFilters.category : [];
  var priceRange = activeFilters.priceRange;

  var matchesSize =
    selectedSizes.length === 0 ||
    selectedSizes.some(function (size) {
      return product.sizes.indexOf(size) > -1;
    });

  var matchesColor =
    selectedColors.length === 0 ||
    selectedColors.some(function (color) {
      return product.colors.indexOf(color) > -1;
    });

  var matchesCategory =
    selectedCategories.length === 0 || selectedCategories.indexOf(product.category) > -1;

  var minPrice = priceRange && Number.isFinite(priceRange.min) ? priceRange.min : -Infinity;
  var maxPrice = priceRange && Number.isFinite(priceRange.max) ? priceRange.max : Infinity;
  var matchesPrice = !priceRange || (product.price >= minPrice && product.price <= maxPrice);

  return matchesSize && matchesColor && matchesCategory && matchesPrice;
}

export function productMatchesSearch(product, searchQuery) {
  if (!product) {
    return false;
  }

  var normalizedQuery = normalizeSearchQuery(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  return (
    product.name.toLowerCase().indexOf(normalizedQuery) > -1 ||
    product.description.toLowerCase().indexOf(normalizedQuery) > -1
  );
}

export function readReviews(productId, storage) {
  var reviewStorage = storage || localStorage;

  try {
    var reviews = JSON.parse(reviewStorage.getItem(createReviewStorageKey(productId)) || '[]');

    if (!Array.isArray(reviews)) {
      return [];
    }

    return reviews.filter(function (review) {
      return review && Number.isFinite(review.rating);
    });
  } catch {
    return [];
  }
}

export function saveReviews(productId, reviews, storage) {
  var reviewStorage = storage || localStorage;

  try {
    reviewStorage.setItem(createReviewStorageKey(productId), JSON.stringify(reviews));
  } catch {
    // Reviews still work in memory if storage is unavailable.
  }
}

export function toggleListValue(list, value) {
  var index = list.indexOf(value);

  if (index === -1) {
    list.push(value);
    return;
  }

  list.splice(index, 1);
}

export function truncateText(text, length) {
  var maxLength = Number.isFinite(Number(length)) ? Number(length) : DEFAULT_TRUNCATE_LENGTH;

  if (typeof text !== 'string' || maxLength <= 0) {
    return '';
  }

  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
