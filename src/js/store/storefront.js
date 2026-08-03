import { reactive } from 'vue';
import {
  calculateCartTotal,
  cloneProduct,
  createCartItem,
  findProductById,
  getCartProductQuantity,
  getCartItemVariantKey,
  getCartItemQuantity,
  getProductStock
} from '../utils/catalog-utils.js';

function cloneItems(items) {
  return Array.isArray(items)
    ? items.filter(Boolean).map(function (item) {
        return cloneProduct(item);
      })
    : [];
}

function createWishlistItem(item) {
  var productId = Number(item && item.id);
  var product = Number.isInteger(productId) ? findProductById(productId) : null;

  if (!product) {
    return null;
  }

  var wishlistItem = cloneProduct(product);

  if (Array.isArray(product.sizes) && product.sizes.indexOf(item.selectedSize) > -1) {
    wishlistItem.selectedSize = item.selectedSize;
  }

  if (Array.isArray(product.colors) && product.colors.indexOf(item.selectedColor) > -1) {
    wishlistItem.selectedColor = item.selectedColor;
  }

  return wishlistItem;
}

function getWishlistItemKey(item) {
  return getCartItemVariantKey(item);
}

export function createStorefrontStore(initialState) {
  var initial = initialState || {};
  var listeners = [];
  var state = reactive({
    cart: [],
    comparison: cloneItems(initial.comparison).slice(0, 3),
    orders: Array.isArray(initial.orders) ? initial.orders.slice(0, 12) : [],
    recentlyViewed: cloneItems(initial.recentlyViewed),
    searchInput: typeof initial.searchInput === 'string' ? initial.searchInput : '',
    searchQuery: typeof initial.searchQuery === 'string' ? initial.searchQuery : '',
    wishlist: Array.isArray(initial.wishlist)
      ? initial.wishlist.map(createWishlistItem).filter(Boolean)
      : []
  });

  function notify() {
    listeners.forEach(function (listener) {
      listener(state);
    });
  }

  cloneItems(initial.cart).forEach(function (item) {
    var availableQuantity = getProductStock(item) - getCartProductQuantity(state.cart, item.id);

    if (availableQuantity > 0) {
      state.cart.push(
        createCartItem(
          item,
          item.selectedSize,
          item.selectedColor,
          Math.min(getCartItemQuantity(item), availableQuantity)
        )
      );
    }
  });

  return {
    state: state,
    addCartItem: function (item) {
      if (!item || !Number.isFinite(Number(item.id))) {
        return false;
      }

      var requestedQuantity = getCartItemQuantity(item);
      var availableQuantity = getProductStock(item) - getCartProductQuantity(state.cart, item.id);

      if (availableQuantity <= 0) {
        return false;
      }

      var cartItem = createCartItem(
        item,
        item.selectedSize,
        item.selectedColor,
        Math.min(requestedQuantity, availableQuantity)
      );
      var itemKey = getCartItemVariantKey(cartItem);
      var matchingItem = state.cart.find(function (existingItem) {
        return getCartItemVariantKey(existingItem) === itemKey;
      });

      if (matchingItem) {
        matchingItem.quantity += getCartItemQuantity(cartItem);
      } else {
        state.cart.push(cartItem);
      }

      notify();
      return true;
    },
    addWishlistItem: function (item) {
      var wishlistItem = createWishlistItem(item);

      if (!wishlistItem) {
        return false;
      }

      var itemKey = getWishlistItemKey(wishlistItem);

      var exists = state.wishlist.some(function (wishlistItem) {
        return getWishlistItemKey(wishlistItem) === itemKey;
      });

      if (exists) {
        return false;
      }

      state.wishlist.push(wishlistItem);
      notify();
      return true;
    },
    clearCart: function () {
      if (state.cart.length === 0) {
        return;
      }

      state.cart.splice(0);
      notify();
    },
    removeCartItem: function (index) {
      if (!Number.isInteger(index) || index < 0 || index >= state.cart.length) {
        return false;
      }

      state.cart.splice(index, 1);
      notify();
      return true;
    },
    removeWishlistItem: function (item) {
      var productId = Number(item && item.id ? item.id : item);
      var itemKey = item && typeof item === 'object' ? getWishlistItemKey(item) : '';
      var index = state.wishlist.findIndex(function (item) {
        return itemKey ? getWishlistItemKey(item) === itemKey : item.id === productId;
      });

      if (index === -1) {
        return false;
      }

      state.wishlist.splice(index, 1);
      notify();
      return true;
    },
    recordRecentlyViewed: function (product) {
      if (!product || !Number.isInteger(Number(product.id))) {
        return false;
      }

      var existingIndex = state.recentlyViewed.findIndex(function (item) {
        return item.id === product.id;
      });

      if (existingIndex > -1) {
        state.recentlyViewed.splice(existingIndex, 1);
      }

      state.recentlyViewed.unshift(cloneProduct(product));
      state.recentlyViewed.splice(6);
      notify();
      return true;
    },
    reset: function () {
      state.cart.splice(0);
      state.comparison.splice(0);
      state.orders.splice(0);
      state.recentlyViewed.splice(0);
      state.searchInput = '';
      state.searchQuery = '';
      state.wishlist.splice(0);
      notify();
    },
    createOrder: function (details) {
      if (!details || !Array.isArray(details.items) || details.items.length === 0) {
        return null;
      }

      var customer = details.customer || {};
      var order = {
        createdAt: new Date().toISOString(),
        customer: {
          address: String(customer.address || ''),
          city: String(customer.city || ''),
          email: String(customer.email || ''),
          name: String(customer.name || ''),
          postcode: String(customer.postcode || '')
        },
        id: 'DEMO-' + Date.now().toString(36).toUpperCase(),
        items: cloneItems(details.items),
        paymentMethod: String(details.paymentMethod || 'credit'),
        total: calculateCartTotal(details.items)
      };

      state.orders.unshift(order);
      state.orders.splice(12);
      notify();
      return order;
    },
    toggleComparison: function (product) {
      if (!product || !Number.isInteger(Number(product.id))) {
        return false;
      }

      var existingIndex = state.comparison.findIndex(function (item) {
        return item.id === product.id;
      });

      if (existingIndex > -1) {
        state.comparison.splice(existingIndex, 1);
        notify();
        return true;
      }

      if (state.comparison.length === 3) {
        return false;
      }

      state.comparison.push(cloneProduct(product));
      notify();
      return true;
    },
    setCartItemQuantity: function (index, quantity) {
      if (!Number.isInteger(index) || index < 0 || index >= state.cart.length) {
        return false;
      }

      var item = state.cart[index];
      var quantityLimit =
        getProductStock(item) - getCartProductQuantity(state.cart, item.id, index);

      state.cart[index].quantity = Math.min(
        getCartItemQuantity({ quantity: quantity }),
        Math.max(1, quantityLimit)
      );
      notify();
      return true;
    },
    getCartItemQuantityLimit: function (index) {
      if (!Number.isInteger(index) || index < 0 || index >= state.cart.length) {
        return 0;
      }

      var item = state.cart[index];

      return getProductStock(item) - getCartProductQuantity(state.cart, item.id, index);
    },
    setSearchInput: function (value) {
      state.searchInput = typeof value === 'string' ? value : '';
      notify();
    },
    setSearchQuery: function (value) {
      state.searchQuery = typeof value === 'string' ? value.trim() : '';
      notify();
    },
    subscribe: function (listener) {
      if (typeof listener !== 'function') {
        return function () {};
      }

      listeners.push(listener);

      return function () {
        listeners = listeners.filter(function (registeredListener) {
          return registeredListener !== listener;
        });
      };
    }
  };
}
