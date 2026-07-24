import { reactive } from 'vue';
import {
  cloneProduct,
  createCartItem,
  getCartItemVariantKey,
  getCartItemQuantity
} from '../utils/catalog-utils.js';

function cloneItems(items) {
  return Array.isArray(items)
    ? items.filter(Boolean).map(function (item) {
        return cloneProduct(item);
      })
    : [];
}

export function createStorefrontStore(initialState) {
  var initial = initialState || {};
  var listeners = [];
  var state = reactive({
    cart: cloneItems(initial.cart),
    searchInput: typeof initial.searchInput === 'string' ? initial.searchInput : '',
    searchQuery: typeof initial.searchQuery === 'string' ? initial.searchQuery : '',
    wishlist: cloneItems(initial.wishlist)
  });

  function notify() {
    listeners.forEach(function (listener) {
      listener(state);
    });
  }

  return {
    state: state,
    addCartItem: function (item) {
      if (!item || !Number.isFinite(Number(item.id))) {
        return false;
      }

      var cartItem = createCartItem(item, item.selectedSize, item.selectedColor, item.quantity);
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
      if (!item || !Number.isFinite(Number(item.id))) {
        return false;
      }

      var exists = state.wishlist.some(function (wishlistItem) {
        return wishlistItem.id === item.id;
      });

      if (exists) {
        return false;
      }

      state.wishlist.push(cloneProduct(item));
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
    removeWishlistItem: function (productId) {
      var index = state.wishlist.findIndex(function (item) {
        return item.id === productId;
      });

      if (index === -1) {
        return false;
      }

      state.wishlist.splice(index, 1);
      notify();
      return true;
    },
    setCartItemQuantity: function (index, quantity) {
      if (!Number.isInteger(index) || index < 0 || index >= state.cart.length) {
        return false;
      }

      state.cart[index].quantity = getCartItemQuantity({ quantity: quantity });
      notify();
      return true;
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
