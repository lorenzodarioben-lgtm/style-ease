import { filterOptions, products } from '../data/catalog.js';
import {
  cloneProduct,
  createEmptyFilters,
  filterProducts,
  formatPrice,
  sortProducts,
  toggleListValue
} from '../utils/catalog-utils.js';
import { createCatalogueQuery, readCatalogueQuery } from '../utils/catalogue-state.js';
import ProductImage from '../components/product-image.js';
import QuickShop from '../components/quick-shop.js';

function getTotalPages(searchQuery, filters, itemsPerPage) {
  return Math.max(
    1,
    Math.ceil(filterProducts(products, searchQuery, filters).length / itemsPerPage)
  );
}

function queriesMatch(source, target) {
  var sourceKeys = Object.keys(source || {});
  var targetKeys = Object.keys(target || {});

  return (
    sourceKeys.length === targetKeys.length &&
    sourceKeys.every(function (key) {
      return target[key] === source[key];
    })
  );
}

export default {
  name: 'ProductsPage',
  components: {
    ProductImage,
    QuickShop
  },
  emits: ['add-to-cart', 'toggle-comparison'],
  props: {
    cart: {
      type: Array,
      default: function () {
        return [];
      }
    },
    comparison: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data: function () {
    return {
      activeFilterDropdown: null,
      currentPage: 1,
      filterOptions: filterOptions,
      filters: createEmptyFilters(),
      itemsPerPage: 6,
      quickShopProduct: null,
      quickShopTrigger: null,
      searchQuery: '',
      sortBy: 'featured'
    };
  },
  created: function () {
    this.applyRouteState();
  },
  mounted: function () {
    document.addEventListener('click', this.handleDocumentClick);
  },
  beforeUnmount: function () {
    document.removeEventListener('click', this.handleDocumentClick);
  },
  computed: {
    catalogueStatus: function () {
      if (!this.processedProducts.length) {
        return 'No matching styles.';
      }

      var firstStyle = (this.currentPage - 1) * this.itemsPerPage + 1;
      var lastStyle = Math.min(firstStyle + this.itemsPerPage - 1, this.processedProducts.length);

      return (
        'Showing styles ' +
        firstStyle +
        ' to ' +
        lastStyle +
        ' of ' +
        this.processedProducts.length +
        '.'
      );
    },
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
      return sortProducts(filterProducts(products, this.searchQuery, this.filters), this.sortBy);
    },
    noResultsMessage: function () {
      return this.searchQuery
        ? 'No products match your search or selected filters'
        : 'No products match your selected filters';
    },
    paginationStatus: function () {
      if (!this.processedProducts.length) {
        return 'No matching styles.';
      }

      return 'Page ' + this.currentPage + ' of ' + this.totalPages + '.';
    },
    totalPages: function () {
      return Math.ceil(this.processedProducts.length / this.itemsPerPage);
    }
  },
  watch: {
    '$route.query': function () {
      this.closeFilterDropdown();
      this.applyRouteState();
    },
    processedProducts: function () {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1;
      }
    }
  },
  methods: {
    addToCart: function (product) {
      this.$emit('add-to-cart', cloneProduct(product));
    },
    closeFilterDropdown: function (restoreFocus) {
      var activeDropdown = this.activeFilterDropdown;

      this.activeFilterDropdown = null;

      if (restoreFocus && activeDropdown && this.$refs) {
        this.$nextTick(function () {
          var trigger = this.$refs['filter-' + activeDropdown];

          if (trigger && typeof trigger.focus === 'function') {
            trigger.focus();
          }
        });
      }
    },
    formatPrice: function (price) {
      return formatPrice(price);
    },
    applyRouteState: function () {
      var routeState = readCatalogueQuery(this.$route.query);
      var currentPage = Math.min(
        routeState.currentPage,
        getTotalPages(routeState.searchQuery, routeState.filters, this.itemsPerPage)
      );

      this.currentPage = currentPage;
      this.filters = routeState.filters;
      this.searchQuery = routeState.searchQuery;
      this.sortBy = routeState.sortBy;

      var canonicalQuery = createCatalogueQuery({
        currentPage: currentPage,
        filters: routeState.filters,
        searchQuery: routeState.searchQuery,
        sortBy: routeState.sortBy
      });

      if (!queriesMatch(this.$route.query, canonicalQuery)) {
        this.$router.replace({
          path: '/products',
          query: canonicalQuery
        });
      }
    },
    applyPriceFilter: function (range) {
      this.filters.priceRange =
        this.filters.priceRange && this.filters.priceRange.label === range.label ? null : range;
      this.resetPageAndSync();
    },
    clearFilters: function () {
      this.activeFilterDropdown = null;
      this.filters = createEmptyFilters();
      this.resetPageAndSync();
    },
    goToPage: function (page) {
      this.currentPage = page;
      this.syncRoute();
    },
    goToProduct: function (productId) {
      this.$router.push('/product/' + productId);
    },
    handleDocumentClick: function (event) {
      var filterBar = this.$refs && this.$refs.filterBar;

      if (this.activeFilterDropdown && filterBar && !filterBar.contains(event.target)) {
        this.closeFilterDropdown();
      }
    },
    nextPage: function () {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
        this.syncRoute();
      }
    },
    closeQuickShop: function () {
      var trigger = this.quickShopTrigger;

      this.quickShopProduct = null;
      this.quickShopTrigger = null;

      if (trigger && typeof trigger.focus === 'function') {
        this.$nextTick(function () {
          trigger.focus();
        });
      }
    },
    openQuickShop: function (product, event) {
      this.quickShopProduct = cloneProduct(product);
      this.quickShopTrigger = event && event.currentTarget ? event.currentTarget : null;
    },
    paginationButtonLabel: function (page) {
      return page === this.currentPage ? 'Page ' + page + ', current page' : 'Page ' + page;
    },
    previousPage: function () {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        this.syncRoute();
      }
    },
    removePriceFilter: function () {
      this.filters.priceRange = null;
      this.resetPageAndSync();
    },
    toggleInStockFilter: function () {
      this.filters.inStock = !this.filters.inStock;
      this.resetPageAndSync();
    },
    setSort: function (sortBy) {
      this.sortBy = sortBy;
      this.resetPageAndSync();
    },
    toggleCategoryFilter: function (category) {
      toggleListValue(this.filters.category, category);
      this.resetPageAndSync();
    },
    toggleColorFilter: function (color) {
      toggleListValue(this.filters.color, color);
      this.resetPageAndSync();
    },
    toggleFilterDropdown: function (type) {
      var isOpening = this.activeFilterDropdown !== type;

      this.activeFilterDropdown = isOpening ? type : null;

      if (isOpening) {
        this.$nextTick(
          function () {
            this.focusFirstFilterOption(type);
          }.bind(this)
        );
      }
    },
    filterButtonLabel: function (label, selectedCount) {
      return selectedCount ? label + ', ' + selectedCount + ' selected' : label;
    },
    filterOptionRef: function (type, index) {
      return index === 0 ? 'filter-option-' + type : null;
    },
    focusFirstFilterOption: function (type) {
      var option = this.$refs && this.$refs['filter-option-' + type];

      if (Array.isArray(option)) {
        option = option[0];
      }

      if (option && typeof option.focus === 'function') {
        option.focus();
      }
    },
    isFilterValueActive: function (type, value) {
      return this.filters[type].indexOf(value) > -1;
    },
    isCompared: function (product) {
      return this.comparison.some(function (item) {
        return item.id === product.id;
      });
    },
    toggleSizeFilter: function (size) {
      toggleListValue(this.filters.size, size);
      this.resetPageAndSync();
    },
    resetPageAndSync: function () {
      this.currentPage = 1;
      this.syncRoute();
    },
    syncRoute: function () {
      this.$router.replace({
        path: '/products',
        query: createCatalogueQuery({
          currentPage: this.currentPage,
          filters: this.filters,
          searchQuery: this.searchQuery,
          sortBy: this.sortBy
        })
      });
    }
  },
  template: `
      <div class="container">
        <router-link to="/" class="back-button" style="color: inherit; text-decoration: none;">
          &larr; Back to Home
        </router-link>

        <h1 class="page-title">Product Catalogue</h1>

        <div class="catalogue-toolbar">
          <p role="status" aria-live="polite">{{ catalogueStatus }}</p>
          <label for="catalogue-sort">
            Sort by
            <select id="catalogue-sort" :value="sortBy" @change="setSort($event.target.value)">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>

        <div ref="filterBar" class="filter-bar" @keydown.escape.prevent="closeFilterDropdown(true)">
          <div class="filter-dropdown-container">
            <button
              class="filter-button"
              type="button"
              ref="filter-category"
              :aria-expanded="String(activeFilterDropdown === 'category')"
              aria-controls="category-filter-options"
              :aria-label="filterButtonLabel('Category filter', filters.category.length)"
              @click.stop="toggleFilterDropdown('category')"
            >
              Category <span v-if="filters.category.length" class="filter-badge">{{ filters.category.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'category'" id="category-filter-options" class="filter-dropdown">
              <h2>Category</h2>
              <div class="filter-options-grid">
                <button
                  v-for="(category, index) in filterOptions.categories"
                  :key="category"
                  :ref="filterOptionRef('category', index)"
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
              ref="filter-size"
              :aria-expanded="String(activeFilterDropdown === 'size')"
              aria-controls="size-filter-options"
              :aria-label="filterButtonLabel('Size filter', filters.size.length)"
              @click.stop="toggleFilterDropdown('size')"
            >
              Size <span v-if="filters.size.length" class="filter-badge">{{ filters.size.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'size'" id="size-filter-options" class="filter-dropdown">
              <h2>Size</h2>
              <div class="filter-options-grid">
                <button
                  v-for="(size, index) in filterOptions.sizes"
                  :key="size"
                  :ref="filterOptionRef('size', index)"
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
              ref="filter-color"
              :aria-expanded="String(activeFilterDropdown === 'color')"
              aria-controls="color-filter-options"
              :aria-label="filterButtonLabel('Color filter', filters.color.length)"
              @click.stop="toggleFilterDropdown('color')"
            >
              Color <span v-if="filters.color.length" class="filter-badge">{{ filters.color.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'color'" id="color-filter-options" class="filter-dropdown">
              <h2>Color</h2>
              <div class="filter-options-grid">
                <button
                  v-for="(color, index) in filterOptions.colors"
                  :key="color"
                  :ref="filterOptionRef('color', index)"
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
              ref="filter-price"
              :aria-expanded="String(activeFilterDropdown === 'price')"
              aria-controls="price-filter-options"
              :aria-label="filters.priceRange ? 'Price filter, 1 selected' : 'Price filter'"
              @click.stop="toggleFilterDropdown('price')"
            >
              Price <span v-if="filters.priceRange" class="filter-badge">1</span>
            </button>
            <div v-if="activeFilterDropdown === 'price'" id="price-filter-options" class="filter-dropdown">
              <h2>Price</h2>
              <div class="filter-options-list">
                <button
                  v-for="(range, index) in filterOptions.priceRanges"
                  :key="range.label"
                  :ref="filterOptionRef('price', index)"
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

          <button
            class="filter-button"
            type="button"
            :class="{ active: filters.inStock }"
            :aria-label="filters.inStock ? 'In-stock filter, active' : 'In-stock filter, inactive'"
            :aria-pressed="String(filters.inStock)"
            @click="toggleInStockFilter"
          >
            In stock
          </button>

          <button class="clear-filters-btn" type="button" @click="clearFilters">Clear All</button>
        </div>

        <div
          v-if="filters.size.length || filters.color.length || filters.priceRange || filters.category.length || filters.inStock"
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

          <div v-if="filters.inStock" class="filter-tag">
            Availability: In stock
            <button type="button" aria-label="Remove in-stock filter" @click="toggleInStockFilter">
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
                <product-image :src="product.image" :alt="product.name" image-class="product-image"></product-image>
              </router-link>
              <button
                class="quick-add-overlay"
                type="button"
                :aria-label="'Quick add ' + product.name + ' to cart'"
                :disabled="product.stock === 0"
                @click.stop="openQuickShop(product, $event)"
              >
                {{ product.stock === 0 ? 'Unavailable' : '+ Quick Add' }}
              </button>
            </div>
            <div class="product-info">
              <h2 class="product-name">
                <router-link :to="'/product/' + product.id">{{ product.name }}</router-link>
              </h2>
              <p class="product-description">{{ product.description }}</p>
              <p class="product-rating" :aria-label="product.rating + ' out of 5 stars'">★ {{ product.rating }}</p>
              <p class="product-price">{{ formatPrice(product.price) }}</p>
              <button
                class="compare-toggle"
                type="button"
                :aria-pressed="String(isCompared(product))"
                @click="$emit('toggle-comparison', product)"
              >
                {{ isCompared(product) ? 'Remove from Compare' : 'Compare' }}
              </button>
              <button class="add-to-cart" type="button" :disabled="product.stock === 0" @click="addToCart(product)">
                {{ product.stock === 0 ? 'Unavailable' : 'Add to Cart' }}
              </button>
            </div>
          </article>
        </div>

        <div v-if="processedProducts.length === 0" class="no-results" role="status">
          <p>{{ noResultsMessage }}</p>
          <button class="clear-all-btn" type="button" @click="clearFilters">Clear All Filters</button>
        </div>

        <quick-shop
          v-if="quickShopProduct"
          :cart="cart"
          :product="quickShopProduct"
          @add-to-cart="addToCart"
          @close="closeQuickShop"
        ></quick-shop>

        <p class="sr-only" role="status" aria-live="polite">{{ paginationStatus }}</p>
        <nav class="pagination" v-if="totalPages > 1" :aria-label="'Product pages. ' + paginationStatus">
          <button type="button" aria-label="Previous page" :disabled="currentPage === 1" @click="previousPage">&larr;</button>
          <button
            type="button"
            v-for="page in pages"
            :key="page"
            :class="{ active: currentPage === page }"
            :aria-current="currentPage === page ? 'page' : null"
            :aria-label="paginationButtonLabel(page)"
            :disabled="currentPage === page"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button type="button" aria-label="Next page" :disabled="currentPage === totalPages" @click="nextPage">&rarr;</button>
        </nav>
      </div>
    `
};
