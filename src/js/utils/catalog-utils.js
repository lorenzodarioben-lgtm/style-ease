import { products } from '../data/catalog.js';

const REVIEW_STORAGE_PREFIX = 'reviews-product-';
const DEFAULT_TRUNCATE_LENGTH = 20;
const MAX_REVIEW_COMMENT_LENGTH = 500;
const MAX_REVIEWS_PER_PRODUCT = 50;

export function calculateCartTotal(cart) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  return cart.reduce(function (total, item) {
    var price = Number(item && item.price);

    return Number.isFinite(price) ? total + price * getCartItemQuantity(item) : total;
  }, 0);
}

export function calculateCartQuantity(cart) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  return cart.reduce(function (total, item) {
    return total + getCartItemQuantity(item);
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
    inStock: false,
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

function getReviewStorage(storage) {
  if (storage) {
    return storage;
  }

  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function sanitizeReview(review) {
  var rating = Number(review && review.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return {
    rating: rating,
    comment:
      typeof review.comment === 'string'
        ? review.comment.trim().slice(0, MAX_REVIEW_COMMENT_LENGTH)
        : ''
  };
}

function sanitizeReviews(reviews) {
  return Array.isArray(reviews)
    ? reviews.map(sanitizeReview).filter(Boolean).slice(-MAX_REVIEWS_PER_PRODUCT)
    : [];
}

export function createSelectedCartItem(product, selectedSize, selectedColor) {
  return createCartItem(product, selectedSize, selectedColor, 1);
}

export function createCartItem(product, selectedSize, selectedColor, quantity) {
  if (!product) {
    return null;
  }

  return Object.assign(cloneProduct(product), {
    quantity: getCartItemQuantity({ quantity: quantity }),
    selectedColor:
      Array.isArray(product.colors) && product.colors.indexOf(selectedColor) > -1
        ? selectedColor
        : product.colors[0] || '',
    selectedSize:
      Array.isArray(product.sizes) && product.sizes.indexOf(selectedSize) > -1
        ? selectedSize
        : getDefaultSize(product)
  });
}

export function getCartItemQuantity(item) {
  var quantity = Math.floor(Number(item && item.quantity));

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

export function getCartItemVariantKey(item) {
  if (!item || !Number.isInteger(Number(item.id))) {
    return '';
  }

  return [item.id, item.selectedSize || '', item.selectedColor || ''].join(':');
}

export function getCartProductQuantity(cart, productId, excludedIndex) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  return cart.reduce(function (total, item, index) {
    if (index === excludedIndex || !item || item.id !== productId) {
      return total;
    }

    return total + getCartItemQuantity(item);
  }, 0);
}

export function getProductStock(product) {
  var stock = Math.floor(Number(product && product.stock));

  return Number.isFinite(stock) && stock > 0 ? stock : 0;
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
  return typeof searchQuery === 'string'
    ? searchQuery.trim().toLowerCase().replace(/\s+/g, ' ')
    : '';
}

export function parseProductId(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  return typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : null;
}

export function productMatchesFilters(product, filters) {
  if (!product) {
    return false;
  }

  var activeFilters = filters || createEmptyFilters();
  var selectedSizes = Array.isArray(activeFilters.size) ? activeFilters.size : [];
  var selectedColors = Array.isArray(activeFilters.color) ? activeFilters.color : [];
  var selectedCategories = Array.isArray(activeFilters.category) ? activeFilters.category : [];
  var inStockOnly = activeFilters.inStock === true;
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
  var matchesAvailability = !inStockOnly || getProductStock(product) > 0;

  return matchesSize && matchesColor && matchesCategory && matchesPrice && matchesAvailability;
}

export function productMatchesSearch(product, searchQuery) {
  if (!product) {
    return false;
  }

  var normalizedQuery = normalizeSearchQuery(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  var searchableValues = [
    product.name,
    product.description,
    product.details,
    product.category,
    product.material
  ]
    .concat(Array.isArray(product.colors) ? product.colors : [])
    .concat(Array.isArray(product.sizes) ? product.sizes : [])
    .filter(function (value) {
      return typeof value === 'string';
    })
    .map(normalizeSearchQuery)
    .join(' ');

  return normalizedQuery.split(' ').every(function (term) {
    return searchableValues.indexOf(term) > -1;
  });
}

export function sortProducts(productList, sortBy) {
  var productsToSort = Array.isArray(productList) ? productList.slice() : [];

  return productsToSort.sort(function (firstProduct, secondProduct) {
    if (sortBy === 'price-asc') {
      return firstProduct.price - secondProduct.price;
    }

    if (sortBy === 'price-desc') {
      return secondProduct.price - firstProduct.price;
    }

    if (sortBy === 'name') {
      return firstProduct.name.localeCompare(secondProduct.name);
    }

    if (sortBy === 'rating') {
      return Number(secondProduct.rating || 0) - Number(firstProduct.rating || 0);
    }

    if (sortBy === 'newest') {
      return String(secondProduct.releasedAt || '').localeCompare(
        String(firstProduct.releasedAt || '')
      );
    }

    return firstProduct.id - secondProduct.id;
  });
}

export function readReviews(productId, storage) {
  var reviewStorage = getReviewStorage(storage);

  if (!reviewStorage) {
    return [];
  }

  try {
    var reviews = JSON.parse(reviewStorage.getItem(createReviewStorageKey(productId)) || '[]');

    if (!Array.isArray(reviews)) {
      return [];
    }

    return sanitizeReviews(reviews);
  } catch {
    return [];
  }
}

export function saveReviews(productId, reviews, storage) {
  var reviewStorage = getReviewStorage(storage);
  var safeReviews = sanitizeReviews(reviews);

  if (!reviewStorage) {
    return safeReviews;
  }

  try {
    reviewStorage.setItem(createReviewStorageKey(productId), JSON.stringify(safeReviews));
  } catch {
    // Reviews still work in memory if storage is unavailable.
  }

  return safeReviews;
}

export function clearReviews(storage) {
  var reviewStorage = getReviewStorage(storage);

  if (!reviewStorage) {
    return false;
  }

  try {
    products.forEach(function (product) {
      reviewStorage.removeItem(createReviewStorageKey(product.id));
    });
    return true;
  } catch {
    return false;
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
