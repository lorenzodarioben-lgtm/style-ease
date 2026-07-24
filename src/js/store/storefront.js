import { reactive } from 'vue';
import { cloneProduct } from '../utils/catalog-utils.js';

function cloneItems(items) {
  return Array.isArray(items)
    ? items.filter(Boolean).map(function (item) {
        return cloneProduct(item);
      })
    : [];
}

export function createStorefrontStore(initialState) {
  var initial = initialState || {};
  var state = reactive({
    cart: cloneItems(initial.cart),
    searchInput: typeof initial.searchInput === 'string' ? initial.searchInput : '',
    searchQuery: typeof initial.searchQuery === 'string' ? initial.searchQuery : '',
    wishlist: cloneItems(initial.wishlist)
  });

  return {
    state: state,
    addCartItem: function (item) {
      if (!item || !Number.isFinite(Number(item.id))) {
        return false;
      }

      state.cart.push(cloneProduct(item));
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
      return true;
    },
    clearCart: function () {
      state.cart.splice(0);
    },
    removeCartItem: function (index) {
      if (!Number.isInteger(index) || index < 0 || index >= state.cart.length) {
        return false;
      }

      state.cart.splice(index, 1);
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
      return true;
    },
    setSearchInput: function (value) {
      state.searchInput = typeof value === 'string' ? value : '';
    },
    setSearchQuery: function (value) {
      state.searchQuery = typeof value === 'string' ? value.trim() : '';
    }
  };
}
