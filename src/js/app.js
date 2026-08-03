import AppHeader from './components/app-header.js';
import Toast from './components/toast.js';
import { createStorefrontStore } from './store/storefront.js';
import { clearStorefrontState, readStorefrontState, saveStorefrontState } from './store/storage.js';
import { calculateCartQuantity, clearReviews } from './utils/catalog-utils.js';
import { createCatalogueQuery, readCatalogueQuery } from './utils/catalogue-state.js';

const CART_BUMP_DURATION_MS = 300;

export default {
  name: 'App',
  components: {
    AppHeader,
    Toast
  },
  data: function () {
    var store = createStorefrontStore(readStorefrontState());

    store.subscribe(function (state) {
      saveStorefrontState(state);
    });

    return {
      cartBumpTimer: null,
      isCartBumping: false,
      store: store
    };
  },
  computed: {
    cartCount: function () {
      return calculateCartQuantity(this.store.state.cart);
    },
    wishlistCount: function () {
      return this.store.state.wishlist.length;
    }
  },
  created: function () {
    this.syncSearchQueryFromRoute(this.$route.query.q);
  },
  beforeUnmount: function () {
    clearTimeout(this.cartBumpTimer);
  },
  methods: {
    addToCart: function (product) {
      if (!this.store.addCartItem(product)) {
        if (this.$refs.toast && typeof this.$refs.toast.show === 'function') {
          this.$refs.toast.show(product.name + ' is no longer available in the selected quantity.');
        }
        return;
      }
      this.bumpCartCount();

      if (this.$refs.toast && typeof this.$refs.toast.show === 'function') {
        this.$refs.toast.show(product.name + ' added to your bag!');
      }
    },
    addToWishlist: function (product) {
      this.store.addWishlistItem(product);
    },
    bumpCartCount: function () {
      clearTimeout(this.cartBumpTimer);
      this.isCartBumping = true;

      this.cartBumpTimer = setTimeout(
        function () {
          this.isCartBumping = false;
        }.bind(this),
        CART_BUMP_DURATION_MS
      );
    },
    clearCart: function () {
      this.store.clearCart();
    },
    clearDemoData: function () {
      this.store.reset();
      clearStorefrontState();
      clearReviews();

      if (this.$refs.toast && typeof this.$refs.toast.show === 'function') {
        this.$refs.toast.show('Saved demo data has been cleared.');
      }
    },
    completeOrder: function (details) {
      if (this.store.createOrder(details)) {
        this.store.clearCart();
      }
    },
    goToCart: function () {
      if (this.$route.path !== '/cart') {
        this.$router.push('/cart');
      }
    },
    performSearch: function () {
      this.store.setSearchQuery(this.store.state.searchInput);

      if (this.$route.path === '/products') {
        var catalogueState = readCatalogueQuery(this.$route.query);

        this.$router.push({
          path: '/products',
          query: createCatalogueQuery({
            currentPage: 1,
            filters: catalogueState.filters,
            searchQuery: this.store.state.searchQuery,
            sortBy: catalogueState.sortBy
          })
        });
        return;
      }

      this.$router.push({
        path: '/products',
        query: this.store.state.searchQuery ? { q: this.store.state.searchQuery } : {}
      });
    },
    removeFromCart: function (index) {
      this.store.removeCartItem(index);
    },
    removeFromWishlist: function (productId) {
      this.store.removeWishlistItem(productId);
    },
    syncSearchQueryFromRoute: function (query) {
      var searchQuery = typeof query === 'string' ? query : '';

      this.store.setSearchInput(searchQuery);
      this.store.setSearchQuery(searchQuery);
    },
    toggleComparison: function (product) {
      var changed = this.store.toggleComparison(product);

      if (!changed && this.$refs.toast && typeof this.$refs.toast.show === 'function') {
        this.$refs.toast.show('You can compare up to three styles at a time.');
      }
    },
    recordRecentlyViewed: function (product) {
      this.store.recordRecentlyViewed(product);
    },
    updateCartQuantity: function (index, quantity) {
      this.store.setCartItemQuantity(index, quantity);
    },
    updateSearchInput: function (value) {
      this.store.setSearchInput(value);
    }
  },
  watch: {
    '$route.query.q': function (query) {
      this.syncSearchQueryFromRoute(query);
    }
  },
  template: `
    <div>
      <a class="skip-link" href="#main-content">Skip to main content</a>

      <app-header
        :cart-count="cartCount"
        :is-cart-bumping="isCartBumping"
        :search-value="store.state.searchInput"
        :wishlist-count="wishlistCount"
        @open-cart="goToCart"
        @submit-search="performSearch"
        @update-search-input="updateSearchInput"
      />

      <toast ref="toast"></toast>

      <main id="main-content" tabindex="-1">
        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            :cart="store.state.cart"
            :comparison="store.state.comparison"
            :orders="store.state.orders"
            :recently-viewed="store.state.recentlyViewed"
            :search-query="store.state.searchQuery"
            :wishlist="store.state.wishlist"
            @add-to-cart="addToCart"
            @add-to-wishlist="addToWishlist"
            @clear-cart="clearCart"
            @clear-demo-data="clearDemoData"
            @complete-order="completeOrder"
            @toggle-comparison="toggleComparison"
            @remove-from-cart="removeFromCart"
            @remove-from-wishlist="removeFromWishlist"
            @update-cart-quantity="updateCartQuantity"
            @view-product="recordRecentlyViewed"
          />
        </router-view>
      </main>
    </div>
  `
};
