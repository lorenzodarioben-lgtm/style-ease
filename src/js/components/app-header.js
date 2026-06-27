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
  methods: {
    closeMenu: function () {
      this.isMenuOpen = false;
    },
    openCart: function () {
      this.$emit('open-cart');
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
        <div
          class="menu-icon"
          role="button"
          tabindex="0"
          aria-label="Toggle navigation"
          @click="toggleMenu"
          @keydown.enter.prevent="toggleMenu"
          @keydown.space.prevent="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
          <nav class="mobile-menu" @click.stop>
            <ul>
              <li><router-link to="/" @click="closeMenu">Home</router-link></li>
              <li><router-link to="/products" @click="closeMenu">Products</router-link></li>
              <li><router-link to="/cart" @click="closeMenu">Cart</router-link></li>
            </ul>
          </nav>
        </div>

        <div class="search-container">
          <input
            type="text"
            placeholder="Search Style Ease"
            class="search-input"
            :value="searchValue"
            @input="updateSearch"
            @keyup.enter="submitSearch"
          >
          <button class="search-button" type="button" aria-label="Search" @click="submitSearch">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <div
          class="shopping-bag"
          role="button"
          tabindex="0"
          aria-label="View shopping cart"
          @click="openCart"
          @keydown.enter.prevent="openCart"
          @keydown.space.prevent="openCart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span class="bag-count" :style="{ transform: isCartBumping ? 'scale(1.2)' : 'scale(1)' }">{{ cartCount }}</span>
        </div>
      </header>
    `
};
