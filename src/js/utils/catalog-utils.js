import { products } from '../data/catalog.js';

const REVIEW_STORAGE_PREFIX = 'reviews-product-';

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

export function findProductById(productId) {
  return products.find(function (product) {
    return product.id === productId;
  });
}

export function getDefaultSize(product) {
  if (!product || !product.sizes.length) {
    return '';
  }

  return product.sizes.indexOf('M') > -1 ? 'M' : product.sizes[0];
}

export function readReviews(productId) {
  try {
    const reviews = JSON.parse(localStorage.getItem(createReviewStorageKey(productId)) || '[]');

    if (!Array.isArray(reviews)) {
      return [];
    }

    return reviews.filter(function (review) {
      return review && Number.isFinite(review.rating);
    });
  } catch (error) {
    return [];
  }
}

export function saveReviews(productId, reviews) {
  try {
    localStorage.setItem(createReviewStorageKey(productId), JSON.stringify(reviews));
  } catch (error) {
    // Reviews still work in memory if storage is unavailable.
  }
}

export function toggleListValue(list, value) {
  const index = list.indexOf(value);

  if (index === -1) {
    list.push(value);
    return;
  }

  list.splice(index, 1);
}
