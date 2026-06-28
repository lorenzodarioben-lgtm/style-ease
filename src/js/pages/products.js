import { filterOptions, products } from '../data/catalog.js';
import {
  cloneProduct,
  createEmptyFilters,
  filterProducts,
  formatPrice,
  toggleListValue
} from '../utils/catalog-utils.js';

export default {
  name: 'ProductsPage',
  emits: ['add-to-cart'],
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      activeFilterDropdown: null,
      currentPage: 1,
      filterOptions: filterOptions,
      filters: createEmptyFilters(),
      itemsPerPage: 6
    };
  },
  created: function () {
    this.applyCategoryFromRoute(this.$route.query.category);
  },
  computed: {
    pages: function () {
      return Array.from({ length: this.totalPages }, function (_, index) {
        return index + 1;
      });
    },
    paginatedProducts: function () {
      var start = (this.currentPage - 1) * this.itemsPerPage;

      return this.processedProducts.slice(start, start + this.itemsPerPage);
    },
    processedProducts: function () {
      return filterProducts(products, this.searchQuery, this.filters);
    },
    noResultsMessage: function () {
      return this.searchQuery
        ? 'No products match your search or selected filters'
        : 'No products match your selected filters';
    },
    totalPages: function () {
      return Math.ceil(this.processedProducts.length / this.itemsPerPage);
    }
  },
  watch: {
    '$route.query.category': function (category) {
      this.applyCategoryFromRoute(category);
    },
    processedProducts: function () {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1;
      }
    },
    searchQuery: function () {
      this.currentPage = 1;
    }
  },
  methods: {
    addToCart: function (product) {
      this.$emit('add-to-cart', cloneProduct(product));
    },
    closeFilterDropdown: function () {
      this.activeFilterDropdown = null;
    },
    formatPrice: function (price) {
      return formatPrice(price);
    },
    applyCategoryFromRoute: function (category) {
      if (category && this.filterOptions.categories.indexOf(category) > -1) {
        this.filters.category = [category];
        this.currentPage = 1;
      }
    },
    applyPriceFilter: function (range) {
      this.filters.priceRange =
        this.filters.priceRange && this.filters.priceRange.label === range.label ? null : range;
      this.currentPage = 1;
    },
    clearFilters: function () {
      this.activeFilterDropdown = null;
      this.filters = createEmptyFilters();
      this.currentPage = 1;
    },
    goToPage: function (page) {
      this.currentPage = page;
    },
    goToProduct: function (productId) {
      this.$router.push('/product/' + productId);
    },
    nextPage: function () {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },
    previousPage: function () {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    removePriceFilter: function () {
      this.filters.priceRange = null;
      this.currentPage = 1;
    },
    toggleCategoryFilter: function (category) {
      toggleListValue(this.filters.category, category);
      this.currentPage = 1;
    },
    toggleColorFilter: function (color) {
      toggleListValue(this.filters.color, color);
      this.currentPage = 1;
    },
    toggleFilterDropdown: function (type) {
      this.activeFilterDropdown = this.activeFilterDropdown === type ? null : type;
    },
    filterButtonLabel: function (label, selectedCount) {
      return selectedCount ? label + ', ' + selectedCount + ' selected' : label;
    },
    isFilterValueActive: function (type, value) {
      return this.filters[type].indexOf(value) > -1;
    },
    toggleSizeFilter: function (size) {
      toggleListValue(this.filters.size, size);
      this.currentPage = 1;
    }
  },
  template: `
      <div class="container">
        <router-link to="/" class="back-button" style="color: inherit; text-decoration: none;">
          &larr; Back to Home
        </router-link>

        <h1 class="page-title">Product Catalogue</h1>

        <div class="filter-bar" @keydown.escape.prevent="closeFilterDropdown">
          <div class="filter-dropdown-container">
            <button
              class="filter-button"
              type="button"
              :aria-expanded="String(activeFilterDropdown === 'category')"
              aria-controls="category-filter-options"
              :aria-label="filterButtonLabel('Category filter', filters.category.length)"
              @click.stop="toggleFilterDropdown('category')"
            >
              Category <span v-if="filters.category.length" class="filter-badge">{{ filters.category.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'category'" id="category-filter-options" class="filter-dropdown">
              <h3>Category</h3>
              <div class="filter-options-grid">
                <button
                  v-for="category in filterOptions.categories"
                  :key="category"
                  type="button"
                  class="filter-checkbox"
                  :class="{ active: isFilterValueActive('category', category) }"
                  :aria-pressed="String(isFilterValueActive('category', category))"
                  @click="toggleCategoryFilter(category)"
                >
                  {{ category }}
                </button>
              </div>
            </div>
          </div>

          <div class="filter-dropdown-container">
            <button
              class="filter-button"
              type="button"
              :aria-expanded="String(activeFilterDropdown === 'size')"
              aria-controls="size-filter-options"
              :aria-label="filterButtonLabel('Size filter', filters.size.length)"
              @click.stop="toggleFilterDropdown('size')"
            >
              Size <span v-if="filters.size.length" class="filter-badge">{{ filters.size.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'size'" id="size-filter-options" class="filter-dropdown">
              <h3>Size</h3>
              <div class="filter-options-grid">
                <button
                  v-for="size in filterOptions.sizes"
                  :key="size"
                  type="button"
                  class="filter-checkbox"
                  :class="{ active: isFilterValueActive('size', size) }"
                  :aria-pressed="String(isFilterValueActive('size', size))"
                  @click="toggleSizeFilter(size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>
          </div>

          <div class="filter-dropdown-container">
            <button
              class="filter-button"
              type="button"
              :aria-expanded="String(activeFilterDropdown === 'color')"
              aria-controls="color-filter-options"
              :aria-label="filterButtonLabel('Color filter', filters.color.length)"
              @click.stop="toggleFilterDropdown('color')"
            >
              Color <span v-if="filters.color.length" class="filter-badge">{{ filters.color.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'color'" id="color-filter-options" class="filter-dropdown">
              <h3>Color</h3>
              <div class="filter-options-grid">
                <button
                  v-for="color in filterOptions.colors"
                  :key="color"
                  type="button"
                  class="filter-checkbox"
                  :class="{ active: isFilterValueActive('color', color) }"
                  :aria-pressed="String(isFilterValueActive('color', color))"
                  @click="toggleColorFilter(color)"
                >
                  {{ color }}
                </button>
              </div>
            </div>
          </div>

          <div class="filter-dropdown-container">
            <button
              class="filter-button"
              type="button"
              :aria-expanded="String(activeFilterDropdown === 'price')"
              aria-controls="price-filter-options"
              :aria-label="filters.priceRange ? 'Price filter, 1 selected' : 'Price filter'"
              @click.stop="toggleFilterDropdown('price')"
            >
              Price <span v-if="filters.priceRange" class="filter-badge">1</span>
            </button>
            <div v-if="activeFilterDropdown === 'price'" id="price-filter-options" class="filter-dropdown">
              <h3>Price</h3>
              <div class="filter-options-list">
                <button
                  v-for="range in filterOptions.priceRanges"
                  :key="range.label"
                  type="button"
                  class="filter-radio"
                  :class="{ active: filters.priceRange && filters.priceRange.label === range.label }"
                  :aria-pressed="String(Boolean(filters.priceRange && filters.priceRange.label === range.label))"
                  @click="applyPriceFilter(range)"
                >
                  {{ range.label }}
                </button>
              </div>
            </div>
          </div>

          <button class="clear-filters-btn" type="button" @click="clearFilters">Clear All</button>
        </div>

        <div
          v-if="filters.size.length || filters.color.length || filters.priceRange || filters.category.length"
          class="active-filters"
        >
          <span>Active Filters:</span>

          <div v-for="size in filters.size" :key="'size-' + size" class="filter-tag">
            Size: {{ size }}
            <button type="button" :aria-label="'Remove size filter ' + size" @click="toggleSizeFilter(size)">
              &times;
            </button>
          </div>

          <div v-for="color in filters.color" :key="'color-' + color" class="filter-tag">
            Color: {{ color }}
            <button type="button" :aria-label="'Remove color filter ' + color" @click="toggleColorFilter(color)">
              &times;
            </button>
          </div>

          <div v-if="filters.priceRange" class="filter-tag">
            Price: {{ filters.priceRange.label }}
            <button type="button" :aria-label="'Remove price filter ' + filters.priceRange.label" @click="removePriceFilter">
              &times;
            </button>
          </div>

          <div v-for="category in filters.category" :key="'category-' + category" class="filter-tag">
            Category: {{ category }}
            <button type="button" :aria-label="'Remove category filter ' + category" @click="toggleCategoryFilter(category)">
              &times;
            </button>
          </div>
        </div>

        <div class="product-grid">
          <article class="product-item" v-for="product in paginatedProducts" :key="product.id">
            <div class="product-image-container">
              <router-link
                class="product-card-link"
                :to="'/product/' + product.id"
                :aria-label="'View details for ' + product.name"
              >
                <img :src="product.image" :alt="product.name" class="product-image">
              </router-link>
              <button
                class="quick-add-overlay"
                type="button"
                :aria-label="'Quick add ' + product.name + ' to cart'"
                @click.stop="addToCart(product)"
              >
                + Quick Add
              </button>
            </div>
            <div class="product-info">
              <h3 class="product-name">
                <router-link :to="'/product/' + product.id">{{ product.name }}</router-link>
              </h3>
              <p class="product-description">{{ product.description }}</p>
              <p class="product-price">{{ formatPrice(product.price) }}</p>
              <button class="add-to-cart" type="button" @click="addToCart(product)">Add to Cart</button>
            </div>
          </article>
        </div>

        <div v-if="processedProducts.length === 0" class="no-results" role="status">
          <p>{{ noResultsMessage }}</p>
          <button class="clear-all-btn" type="button" @click="clearFilters">Clear All Filters</button>
        </div>

        <nav class="pagination" v-if="totalPages > 1" aria-label="Product pages">
          <a href="#" aria-label="Previous page" @click.prevent="previousPage" v-if="currentPage > 1">&larr;</a>
          <a
            href="#"
            v-for="page in pages"
            :key="page"
            :class="{ active: currentPage === page }"
            :aria-current="currentPage === page ? 'page' : null"
            :aria-label="'Page ' + page"
            @click.prevent="goToPage(page)"
          >
            {{ page }}
          </a>
          <a href="#" aria-label="Next page" @click.prevent="nextPage" v-if="currentPage < totalPages">&rarr;</a>
        </nav>
      </div>
    `
};
