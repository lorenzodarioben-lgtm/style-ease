(function (StyleEase) {
  'use strict';

  var CART_BUMP_DURATION_MS = 300;
  var utils = StyleEase.utils;

  new Vue({
    el: '#app',
    router: StyleEase.createRouter(),
    data: function () {
      return {
        cart: [],
        cartBumpTimer: null,
        isCartBumping: false,
        searchInput: '',
        searchQuery: '',
        wishlist: []
      };
    },
    computed: {
      cartCount: function () {
        return this.cart.length;
      }
    },
    beforeDestroy: function () {
      clearTimeout(this.cartBumpTimer);
    },
    methods: {
      addToCart: function (product) {
        this.cart.push(utils.cloneProduct(product));
        this.bumpCartCount();

        if (this.$refs.toast && typeof this.$refs.toast.show === 'function') {
          this.$refs.toast.show(product.name + ' added to your bag!');
        }
      },
      addToWishlist: function (product) {
        var exists = this.wishlist.some(function (item) {
          return item.id === product.id;
        });

        if (!exists) {
          this.wishlist.push(utils.cloneProduct(product));
        }
      },
      bumpCartCount: function () {
        clearTimeout(this.cartBumpTimer);
        this.isCartBumping = true;

        this.cartBumpTimer = setTimeout(function () {
          this.isCartBumping = false;
        }.bind(this), CART_BUMP_DURATION_MS);
      },
      clearCart: function () {
        this.cart = [];
      },
      goToCart: function () {
        if (this.$route.path !== '/cart') {
          this.$router.push('/cart');
        }
      },
      performSearch: function () {
        this.searchQuery = this.searchInput.trim();

        if (this.$route.path !== '/products') {
          this.$router.push('/products');
        }
      },
      removeFromCart: function (index) {
        if (index >= 0 && index < this.cart.length) {
          this.cart.splice(index, 1);
        }
      },
      removeFromWishlist: function (productId) {
        this.wishlist = this.wishlist.filter(function (item) {
          return item.id !== productId;
        });
      },
      updateSearchInput: function (value) {
        this.searchInput = value;
      }
    },
    template: `
      <div>
        <app-header
          :cart-count="cartCount"
          :is-cart-bumping="isCartBumping"
          :search-value="searchInput"
          @open-cart="goToCart"
          @submit-search="performSearch"
          @update-search-input="updateSearchInput"
        />

        <toast ref="toast"></toast>

        <main>
          <router-view
            :cart="cart"
            :search-query="searchQuery"
            :wishlist="wishlist"
            @add-to-cart="addToCart"
            @add-to-wishlist="addToWishlist"
            @clear-cart="clearCart"
            @remove-from-cart="removeFromCart"
            @remove-from-wishlist="removeFromWishlist"
          />
        </main>
      </div>
    `
  });
}(window.StyleEase = window.StyleEase || {}));
