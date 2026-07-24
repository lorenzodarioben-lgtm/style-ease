import { createCartItem, findProductById } from '../utils/catalog-utils.js';

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

  var cartItem = createCartItem(
    product,
    isKnownOption(product, 'sizes', item.selectedSize) ? item.selectedSize : '',
    isKnownOption(product, 'colors', item.selectedColor) ? item.selectedColor : '',
    item.quantity
  );

  cartItem.price = Number.isFinite(Number(item.price)) ? Number(item.price) : product.price;

  return cartItem;
}

function readWishlistItem(item) {
  var productId = Number(item && item.id);
  var product = Number.isInteger(productId) ? findProductById(productId) : null;

  return product ? Object.assign({}, product) : null;
}

function readRecentItem(item) {
  return readWishlistItem(item);
}

function readOrder(item) {
  if (!item || typeof item.id !== 'string' || !Array.isArray(item.items)) {
    return null;
  }

  var customer = item.customer || {};

  return {
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    customer: {
      address: typeof customer.address === 'string' ? customer.address : '',
      city: typeof customer.city === 'string' ? customer.city : '',
      email: typeof customer.email === 'string' ? customer.email : '',
      name: typeof customer.name === 'string' ? customer.name : '',
      postcode: typeof customer.postcode === 'string' ? customer.postcode : ''
    },
    id: item.id,
    items: item.items.map(readCartItem).filter(Boolean),
    paymentMethod: typeof item.paymentMethod === 'string' ? item.paymentMethod : 'credit',
    total: Number.isFinite(Number(item.total)) ? Number(item.total) : 0
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

    return {
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
            quantity: Number.isFinite(Number(item.quantity))
              ? Math.max(1, Math.floor(item.quantity))
              : 1,
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
    ? state.orders
        .filter(function (order) {
          return order && typeof order.id === 'string' && Array.isArray(order.items);
        })
        .slice(0, 12)
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
