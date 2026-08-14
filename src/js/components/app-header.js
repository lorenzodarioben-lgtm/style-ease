import { products } from '../data/catalog.js';
import { createEmptyFilters, filterProducts, formatPrice } from '../utils/catalog-utils.js';

export default {
  name: 'AppHeader',
  props: {
    cartCount: {
      type: Number,
      default: 0
    },
    comparisonCount: {
      type: Number,
      default: 0
    },
    isCartBumping: {
      type: Boolean,
      default: false
    },
    searchValue: {
      type: String,
      default: ''
    },
    wishlistCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['open-cart', 'submit-search', 'update-search-input'],
  data: function () {
    return {
      isMenuOpen: false,
      isSearchSuggestionsOpen: true
    };
  },
  computed: {
    cartButtonLabel: function () {
      var itemLabel = this.cartCount === 1 ? 'item' : 'items';

      return 'View shopping cart, ' + this.cartCount + ' ' + itemLabel;
    },
    comparisonLinkLabel: function () {
      var itemLabel = this.comparisonCount === 1 ? 'style selected' : 'styles selected';

      return this.comparisonCount
        ? 'Compare styles, ' + this.comparisonCount + ' ' + itemLabel
        : 'Compare styles';
    },
    hasSearchSuggestions: function () {
      return this.isSearchSuggestionsOpen && this.searchSuggestions.length > 0;
    },
    menuButtonLabel: function () {
      return this.isMenuOpen ? 'Close navigation' : 'Open navigation';
    },
    searchSuggestions: function () {
      var query = this.searchValue.trim();

      return query ? filterProducts(products, query, createEmptyFilters()).slice(0, 5) : [];
    }
  },
  watch: {
    '$route.fullPath': function () {
      this.closeMenu();
    }
  },
  methods: {
    closeMenu: function (returnFocus) {
      var wasOpen = this.isMenuOpen;

      this.isMenuOpen = false;

      if (returnFocus && wasOpen && this.$refs) {
        this.$nextTick(
          function () {
            var menuButton = this.$refs.menuButton;

            if (menuButton && typeof menuButton.focus === 'function') {
              menuButton.focus();
            }
          }.bind(this)
        );
      }
    },
    closeSearchSuggestions: function () {
      this.isSearchSuggestionsOpen = false;
    },
    focusSearchInput: function () {
      var searchInput = this.$refs && this.$refs.searchInput;

      if (searchInput && typeof searchInput.focus === 'function') {
        searchInput.focus();
      }
    },
    handleSearchFocusOut: function () {
      var searchContainer = this.$refs && this.$refs.searchContainer;

      this.$nextTick(
        function () {
          if (
            typeof document !== 'undefined' &&
            searchContainer &&
            !searchContainer.contains(document.activeElement)
          ) {
            this.closeSearchSuggestions();
          }
        }.bind(this)
      );
    },
    focusSuggestion: function (index) {
      if (!this.searchSuggestions.length) {
        return;
      }

      if (index < 0) {
        this.focusSearchInput();
        return;
      }

      var suggestionIndex = Math.min(index, this.searchSuggestions.length - 1);

      this.$nextTick(
        function () {
          var suggestion = this.$refs && this.$refs['search-suggestion-' + suggestionIndex];

          if (Array.isArray(suggestion)) {
            suggestion = suggestion[0];
          }

          if (suggestion && suggestion.$el) {
            suggestion = suggestion.$el;
          }

          if (suggestion && typeof suggestion.focus === 'function') {
            suggestion.focus();
          }
        }.bind(this)
      );
    },
    formatPrice: function (price) {
      return formatPrice(price);
    },
    openCart: function () {
      this.$emit('open-cart');
    },
    isCurrentRoute: function (path) {
      return this.$route.path === path;
    },
    submitSearch: function () {
      this.closeMenu();
      this.closeSearchSuggestions();
      this.$emit('submit-search');
    },
    toggleMenu: function () {
      this.isMenuOpen = !this.isMenuOpen;
    },
    updateSearch: function (event) {
      this.isSearchSuggestionsOpen = true;
      this.$emit('update-search-input', event.target.value);
    }
  },
  template: `
      <header class="top-bar container" :class="{ 'menu-open': isMenuOpen }">
        <button
          class="menu-icon"
          type="button"
          :aria-label="menuButtonLabel"
          :aria-expanded="String(isMenuOpen)"
          aria-controls="primary-navigation"
          ref="menuButton"
          @click="toggleMenu"
          @keydown.escape.prevent="closeMenu(true)"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>

        <nav
          id="primary-navigation"
          class="mobile-menu"
          aria-label="Primary navigation"
          v-show="isMenuOpen"
          @click.stop
          @keydown.escape.prevent="closeMenu(true)"
        >
          <ul>
            <li>
              <router-link to="/" :aria-current="isCurrentRoute('/') ? 'page' : null" @click="closeMenu">
                Home
              </router-link>
            </li>
            <li>
              <router-link
                to="/orders"
                :aria-current="isCurrentRoute('/orders') ? 'page' : null"
                @click="closeMenu"
              >
                Receipts
              </router-link>
            </li>
            <li>
              <router-link
                to="/compare"
                :aria-current="isCurrentRoute('/compare') ? 'page' : null"
                :aria-label="comparisonLinkLabel"
                @click="closeMenu"
              >
                Compare <span v-if="comparisonCount" aria-hidden="true">({{ comparisonCount }})</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/products"
                :aria-current="isCurrentRoute('/products') ? 'page' : null"
                @click="closeMenu"
              >
                Products
              </router-link>
            </li>
            <li>
              <router-link
                to="/wishlist"
                :aria-current="isCurrentRoute('/wishlist') ? 'page' : null"
                @click="closeMenu"
              >
                Wishlist <span v-if="wishlistCount" aria-label="saved items">({{ wishlistCount }})</span>
              </router-link>
            </li>
            <li>
              <router-link to="/cart" :aria-current="isCurrentRoute('/cart') ? 'page' : null" @click="closeMenu">
                Cart
              </router-link>
            </li>
          </ul>
        </nav>

        <form
          ref="searchContainer"
          class="search-container"
          role="search"
          @submit.prevent="submitSearch"
          @focusout="handleSearchFocusOut"
        >
          <label class="sr-only" for="site-search">Search Style Ease</label>
          <input
            id="site-search"
            type="text"
            role="combobox"
            placeholder="Search Style Ease"
            class="search-input"
            autocomplete="off"
            aria-autocomplete="list"
            :aria-controls="hasSearchSuggestions ? 'search-suggestions' : null"
            :aria-expanded="String(hasSearchSuggestions)"
            :value="searchValue"
            ref="searchInput"
            @focus="isSearchSuggestionsOpen = true"
            @input="updateSearch"
            @keydown.down.prevent="focusSuggestion(0)"
            @keydown.escape.prevent="closeSearchSuggestions"
          >
          <button class="search-button" type="submit" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <ul
            v-if="hasSearchSuggestions"
            id="search-suggestions"
            class="search-suggestions"
            aria-label="Search suggestions"
          >
            <li v-for="(product, index) in searchSuggestions" :key="product.id">
              <router-link
                :to="'/product/' + product.id"
                :ref="'search-suggestion-' + index"
                @click="closeSearchSuggestions"
                @keydown.down.prevent="focusSuggestion(index + 1)"
                @keydown.escape.prevent="focusSearchInput"
                @keydown.up.prevent="focusSuggestion(index - 1)"
              >
                <span>{{ product.name }}</span>
                <strong>{{ formatPrice(product.price) }}</strong>
              </router-link>
            </li>
          </ul>
        </form>

        <button
          class="shopping-bag"
          type="button"
          :aria-label="cartButtonLabel"
          @click="openCart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span
            class="bag-count"
            aria-hidden="true"
            :style="{ transform: isCartBumping ? 'scale(1.2)' : 'scale(1)' }"
          >
            {{ cartCount }}
          </span>
        </button>
      </header>
    `
};
