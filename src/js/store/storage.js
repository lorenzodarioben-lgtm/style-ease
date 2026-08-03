import { calculateCartTotal, createCartItem, findProductById } from '../utils/catalog-utils.js';

export const STOREFRONT_STORAGE_KEY = 'style-ease-storefront-v1';
const STOREFRONT_STORAGE_VERSION = 1;
const MAX_PERSISTED_PRICE = 100_000;
const PAYMENT_METHODS = ['credit', 'paypal', 'applepay'];

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
  return (
    typeof value === 'string' &&
    Array.isArray(product && product[property]) &&
    product[property].indexOf(value) > -1
  );
}

function readPrice(value, fallback) {
  var price = Number(value);

  return Number.isFinite(price) && price > 0 && price <= MAX_PERSISTED_PRICE ? price : fallback;
}

function writeCartItem(item) {
  if (!item || !Number.isInteger(item.id)) {
    return null;
  }

  var product = findProductById(item.id);

  if (!product) {
    return null;
  }

  return {
    id: item.id,
    price: readPrice(item.price, product.price),
    quantity: Number.isFinite(Number(item.quantity)) ? Math.max(1, Math.floor(item.quantity)) : 1,
    selectedColor: typeof item.selectedColor === 'string' ? item.selectedColor : '',
    selectedSize: typeof item.selectedSize === 'string' ? item.selectedSize : ''
  };
}

function readCartItem(item) {
  if (!item || !Number.isInteger(item.id)) {
    return null;
  }

  var product = findProductById(item.id);

  if (!product) {
    return null;
  }

  var cartItem = createCartItem(
    product,
    isKnownOption(product, 'sizes', item.selectedSize) ? item.selectedSize : '',
    isKnownOption(product, 'colors', item.selectedColor) ? item.selectedColor : '',
    item.quantity
  );

  cartItem.price = readPrice(item.price, product.price);

  return cartItem;
}

function readWishlistItem(item) {
  var productId = Number(item && item.id);
  var product = Number.isInteger(productId) ? findProductById(productId) : null;
  var wishlistItem = product ? Object.assign({}, product) : null;

  if (!wishlistItem) {
    return null;
  }

  if (isKnownOption(product, 'sizes', item.selectedSize)) {
    wishlistItem.selectedSize = item.selectedSize;
  }

  if (isKnownOption(product, 'colors', item.selectedColor)) {
    wishlistItem.selectedColor = item.selectedColor;
  }

  return wishlistItem;
}

function writeWishlistItem(item) {
  var productId = Number(item && item.id);
  var product = Number.isInteger(productId) ? findProductById(productId) : null;

  if (!product) {
    return null;
  }

  var wishlistItem = { id: product.id };

  if (isKnownOption(product, 'sizes', item.selectedSize)) {
    wishlistItem.selectedSize = item.selectedSize;
  }

  if (isKnownOption(product, 'colors', item.selectedColor)) {
    wishlistItem.selectedColor = item.selectedColor;
  }

  return wishlistItem;
}

function readRecentItem(item) {
  return readWishlistItem(item);
}

function hasLegacyCustomerData(orders) {
  return (
    Array.isArray(orders) &&
    orders.some(function (order) {
      return order && Object.prototype.hasOwnProperty.call(order, 'customer');
    })
  );
}

function readOrder(item) {
  if (!item || typeof item.id !== 'string' || !Array.isArray(item.items)) {
    return null;
  }

  var items = item.items.map(readCartItem).filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return {
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    id: item.id,
    items: items,
    paymentMethod: PAYMENT_METHODS.indexOf(item.paymentMethod) > -1 ? item.paymentMethod : 'credit',
    total: calculateCartTotal(items)
  };
}

function writeOrder(order) {
  if (!order || typeof order.id !== 'string' || !Array.isArray(order.items)) {
    return null;
  }

  var items = order.items.map(writeCartItem).filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return {
    createdAt: typeof order.createdAt === 'string' ? order.createdAt : '',
    id: order.id,
    items: items,
    paymentMethod:
      PAYMENT_METHODS.indexOf(order.paymentMethod) > -1 ? order.paymentMethod : 'credit',
    total: calculateCartTotal(items)
  };
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

    var state = {
      cart: Array.isArray(saved.cart) ? saved.cart.map(readCartItem).filter(Boolean) : [],
      comparison: Array.isArray(saved.comparison)
        ? saved.comparison.map(readRecentItem).filter(Boolean).slice(0, 3)
        : [],
      orders: Array.isArray(saved.orders)
        ? saved.orders.map(readOrder).filter(Boolean).slice(0, 12)
        : [],
      recentlyViewed: Array.isArray(saved.recentlyViewed)
        ? saved.recentlyViewed.map(readRecentItem).filter(Boolean).slice(0, 6)
        : [],
      wishlist: Array.isArray(saved.wishlist)
        ? saved.wishlist.map(readWishlistItem).filter(Boolean)
        : []
    };

    if (hasLegacyCustomerData(saved.orders)) {
      saveStorefrontState(state, browserStorage);
    }

    return state;
  } catch {
    return {};
  }
}

export function saveStorefrontState(state, storage) {
  var browserStorage = getStorage(storage);

  if (!browserStorage || !state) {
    return;
  }

  var cart = Array.isArray(state.cart) ? state.cart.map(writeCartItem).filter(Boolean) : [];
  var wishlist = Array.isArray(state.wishlist)
    ? state.wishlist.map(writeWishlistItem).filter(Boolean)
    : [];
  var recentlyViewed = Array.isArray(state.recentlyViewed)
    ? state.recentlyViewed
        .filter(function (item) {
          return item && Number.isInteger(item.id);
        })
        .slice(0, 6)
        .map(function (item) {
          return { id: item.id };
        })
    : [];
  var comparison = Array.isArray(state.comparison)
    ? state.comparison
        .filter(function (item) {
          return item && Number.isInteger(item.id);
        })
        .slice(0, 3)
        .map(function (item) {
          return { id: item.id };
        })
    : [];
  var orders = Array.isArray(state.orders)
    ? state.orders.map(writeOrder).filter(Boolean).slice(0, 12)
    : [];

  try {
    browserStorage.setItem(
      STOREFRONT_STORAGE_KEY,
      JSON.stringify({
        version: STOREFRONT_STORAGE_VERSION,
        cart: cart,
        comparison: comparison,
        orders: orders,
        recentlyViewed: recentlyViewed,
        wishlist: wishlist
      })
    );
  } catch {
    // The storefront remains usable when browser storage is unavailable.
  }
}

export function clearStorefrontState(storage) {
  var browserStorage = getStorage(storage);

  if (!browserStorage) {
    return false;
  }

  try {
    browserStorage.removeItem(STOREFRONT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
