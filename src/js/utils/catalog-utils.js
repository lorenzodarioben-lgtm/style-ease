(function (StyleEase) {
  'use strict';

  var REVIEW_STORAGE_PREFIX = 'reviews-product-';

  function cloneProduct(product) {
    return Object.assign({}, product);
  }

  function createEmptyFilters() {
    return {
      size: [],
      color: [],
      category: [],
      priceRange: null
    };
  }

  function createEmptyReview() {
    return {
      rating: 0,
      comment: ''
    };
  }

  function createReviewStorageKey(productId) {
    return REVIEW_STORAGE_PREFIX + productId;
  }

  function createSelectedCartItem(product, selectedSize, selectedColor) {
    return Object.assign(cloneProduct(product), {
      selectedSize: selectedSize,
      selectedColor: selectedColor
    });
  }

  function findProductById(productId) {
    return StyleEase.data.products.find(function (product) {
      return product.id === productId;
    });
  }

  function getDefaultSize(product) {
    if (!product || !product.sizes.length) {
      return '';
    }

    return product.sizes.indexOf('M') > -1 ? 'M' : product.sizes[0];
  }

  function readReviews(productId) {
    try {
      var reviews = JSON.parse(localStorage.getItem(createReviewStorageKey(productId)) || '[]');

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

  function saveReviews(productId, reviews) {
    try {
      localStorage.setItem(createReviewStorageKey(productId), JSON.stringify(reviews));
    } catch (error) {
      // Reviews still work in memory if storage is unavailable.
    }
  }

  function toggleListValue(list, value) {
    var index = list.indexOf(value);

    if (index === -1) {
      list.push(value);
      return;
    }

    list.splice(index, 1);
  }

  StyleEase.utils = {
    cloneProduct: cloneProduct,
    createEmptyFilters: createEmptyFilters,
    createEmptyReview: createEmptyReview,
    createSelectedCartItem: createSelectedCartItem,
    findProductById: findProductById,
    getDefaultSize: getDefaultSize,
    readReviews: readReviews,
    saveReviews: saveReviews,
    toggleListValue: toggleListValue
  };
}(window.StyleEase = window.StyleEase || {}));
