export default {
  name: 'AppHeader',
  props: {
    cartCount: {
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
    }
  },
  emits: ['open-cart', 'submit-search', 'update-search-input'],
  data: function () {
    return {
      isMenuOpen: false
    };
  },
  computed: {
    cartButtonLabel: function () {
      var itemLabel = this.cartCount === 1 ? 'item' : 'items';

      return 'View shopping cart, ' + this.cartCount + ' ' + itemLabel;
    },
    menuButtonLabel: function () {
      return this.isMenuOpen ? 'Close navigation' : 'Open navigation';
    }
  },
  methods: {
    closeMenu: function () {
      this.isMenuOpen = false;
    },
    openCart: function () {
      this.$emit('open-cart');
    },
    isCurrentRoute: function (path) {
      return this.$route.path === path;
    },
    submitSearch: function () {
      this.$emit('submit-search');
    },
    toggleMenu: function () {
      this.isMenuOpen = !this.isMenuOpen;
    },
    updateSearch: function (event) {
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
          @click="toggleMenu"
          @keydown.escape.prevent="closeMenu"
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
          @keydown.escape.prevent="closeMenu"
        >
          <ul>
            <li>
              <router-link to="/" :aria-current="isCurrentRoute('/') ? 'page' : null" @click="closeMenu">
                Home
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
              <router-link to="/cart" :aria-current="isCurrentRoute('/cart') ? 'page' : null" @click="closeMenu">
                Cart
              </router-link>
            </li>
          </ul>
        </nav>

        <form class="search-container" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="site-search">Search Style Ease</label>
          <input
            id="site-search"
            type="text"
            placeholder="Search Style Ease"
            class="search-input"
            autocomplete="off"
            :value="searchValue"
            @input="updateSearch"
          >
          <button class="search-button" type="submit" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
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
