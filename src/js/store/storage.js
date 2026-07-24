import { findProductById } from '../utils/catalog-utils.js';

export const STOREFRONT_STORAGE_KEY = 'style-ease-storefront-v1';
const STOREFRONT_STORAGE_VERSION = 1;

function getStorage(storage) {
  if (storage) {
    return storage;
  }

  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function isKnownOption(product, property, value) {
  return typeof value === 'string' && product[property].indexOf(value) > -1;
}

function readCartItem(item) {
  if (!item || !Number.isInteger(item.id)) {
    return null;
  }

  var product = findProductById(item.id);

  if (!product) {
    return null;
  }

  return Object.assign({}, product, {
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : product.price,
    selectedColor: isKnownOption(product, 'colors', item.selectedColor)
      ? item.selectedColor
      : product.colors[0] || '',
    selectedSize: isKnownOption(product, 'sizes', item.selectedSize)
      ? item.selectedSize
      : product.sizes[0] || ''
  });
}

function readWishlistItem(item) {
  var productId = Number(item && item.id);
  var product = Number.isInteger(productId) ? findProductById(productId) : null;

  return product ? Object.assign({}, product) : null;
}

export function readStorefrontState(storage) {
  var browserStorage = getStorage(storage);

  if (!browserStorage) {
    return {};
  }

  try {
    var saved = JSON.parse(browserStorage.getItem(STOREFRONT_STORAGE_KEY) || '{}');

    if (!saved || saved.version !== STOREFRONT_STORAGE_VERSION) {
      return {};
    }

    return {
      cart: Array.isArray(saved.cart) ? saved.cart.map(readCartItem).filter(Boolean) : [],
      wishlist: Array.isArray(saved.wishlist)
        ? saved.wishlist.map(readWishlistItem).filter(Boolean)
        : []
    };
  } catch {
    return {};
  }
}

export function saveStorefrontState(state, storage) {
  var browserStorage = getStorage(storage);

  if (!browserStorage || !state) {
    return;
  }

  var cart = Array.isArray(state.cart)
    ? state.cart
        .filter(function (item) {
          return item && Number.isInteger(item.id);
        })
        .map(function (item) {
          return {
            id: item.id,
            price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
            selectedColor: typeof item.selectedColor === 'string' ? item.selectedColor : '',
            selectedSize: typeof item.selectedSize === 'string' ? item.selectedSize : ''
          };
        })
    : [];
  var wishlist = Array.isArray(state.wishlist)
    ? state.wishlist
        .filter(function (item) {
          return item && Number.isInteger(item.id);
        })
        .map(function (item) {
          return { id: item.id };
        })
    : [];

  try {
    browserStorage.setItem(
      STOREFRONT_STORAGE_KEY,
      JSON.stringify({
        version: STOREFRONT_STORAGE_VERSION,
        cart: cart,
        wishlist: wishlist
      })
    );
  } catch {
    // The storefront remains usable when browser storage is unavailable.
  }
}
