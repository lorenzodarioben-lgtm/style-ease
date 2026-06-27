import { filterOptions, products } from '../data/catalog.js';
import { cloneProduct, createEmptyFilters, toggleListValue } from '../utils/catalog-utils.js';

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
        var query = this.searchQuery.trim().toLowerCase();
        var filters = this.filters;

        return products.filter(function (product) {
          var matchesSearch = !query ||
            product.name.toLowerCase().indexOf(query) > -1 ||
            product.description.toLowerCase().indexOf(query) > -1;

          var matchesSize = filters.size.length === 0 ||
            filters.size.some(function (size) {
              return product.sizes.indexOf(size) > -1;
            });

          var matchesColor = filters.color.length === 0 ||
            filters.color.some(function (color) {
              return product.colors.indexOf(color) > -1;
            });

          var matchesCategory = filters.category.length === 0 ||
            filters.category.indexOf(product.category) > -1;

          var matchesPrice = !filters.priceRange ||
            product.price >= filters.priceRange.min && product.price <= filters.priceRange.max;

          return matchesSearch && matchesSize && matchesColor && matchesCategory && matchesPrice;
        });
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

        <div class="filter-bar">
          <div class="filter-dropdown-container">
            <button class="filter-button" type="button" @click.stop="toggleFilterDropdown('category')">
              Category <span v-if="filters.category.length" class="filter-badge">{{ filters.category.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'category'" class="filter-dropdown">
              <h3>Category</h3>
              <div class="filter-options-grid">
                <div
                  v-for="category in filterOptions.categories"
                  :key="category"
                  class="filter-checkbox"
                  :class="{ active: filters.category.indexOf(category) > -1 }"
                  @click="toggleCategoryFilter(category)"
                >
                  {{ category }}
                </div>
              </div>
            </div>
          </div>

          <div class="filter-dropdown-container">
            <button class="filter-button" type="button" @click.stop="toggleFilterDropdown('size')">
              Size <span v-if="filters.size.length" class="filter-badge">{{ filters.size.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'size'" class="filter-dropdown">
              <h3>Size</h3>
              <div class="filter-options-grid">
                <div
                  v-for="size in filterOptions.sizes"
                  :key="size"
                  class="filter-checkbox"
                  :class="{ active: filters.size.indexOf(size) > -1 }"
                  @click="toggleSizeFilter(size)"
                >
                  {{ size }}
                </div>
              </div>
            </div>
          </div>

          <div class="filter-dropdown-container">
            <button class="filter-button" type="button" @click.stop="toggleFilterDropdown('color')">
              Color <span v-if="filters.color.length" class="filter-badge">{{ filters.color.length }}</span>
            </button>
            <div v-if="activeFilterDropdown === 'color'" class="filter-dropdown">
              <h3>Color</h3>
              <div class="filter-options-grid">
                <div
                  v-for="color in filterOptions.colors"
                  :key="color"
                  class="filter-checkbox"
                  :class="{ active: filters.color.indexOf(color) > -1 }"
                  @click="toggleColorFilter(color)"
                >
                  {{ color }}
                </div>
              </div>
            </div>
          </div>

          <div class="filter-dropdown-container">
            <button class="filter-button" type="button" @click.stop="toggleFilterDropdown('price')">
              Price <span v-if="filters.priceRange" class="filter-badge">1</span>
            </button>
            <div v-if="activeFilterDropdown === 'price'" class="filter-dropdown">
              <h3>Price</h3>
              <div class="filter-options-list">
                <div
                  v-for="range in filterOptions.priceRanges"
                  :key="range.label"
                  class="filter-radio"
                  :class="{ active: filters.priceRange && filters.priceRange.label === range.label }"
                  @click="applyPriceFilter(range)"
                >
                  {{ range.label }}
                </div>
              </div>
            </div>
          </div>

          <button class="clear-filters-btn" type="button" @click="clearFilters">Clear All</button>
        </div>

        <div v-if="filters.size.length || filters.color.length || filters.priceRange || filters.category.length" class="active-filters">
          <span>Active Filters:</span>

          <div v-for="size in filters.size" :key="'size-' + size" class="filter-tag">
            Size: {{ size }} <button type="button" @click="toggleSizeFilter(size)">&times;</button>
          </div>

          <div v-for="color in filters.color" :key="'color-' + color" class="filter-tag">
            Color: {{ color }} <button type="button" @click="toggleColorFilter(color)">&times;</button>
          </div>

          <div v-if="filters.priceRange" class="filter-tag">
            Price: {{ filters.priceRange.label }} <button type="button" @click="removePriceFilter">&times;</button>
          </div>

          <div v-for="category in filters.category" :key="'category-' + category" class="filter-tag">
            Category: {{ category }} <button type="button" @click="toggleCategoryFilter(category)">&times;</button>
          </div>
        </div>

        <div class="product-grid">
          <div class="product-item" v-for="product in paginatedProducts" :key="product.id" @click="goToProduct(product.id)">
            <div class="product-image-container">
              <img :src="product.image" :alt="product.name" class="product-image">
              <div class="quick-add-overlay" @click.stop="addToCart(product)">+ Quick Add</div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <p class="product-price">\${{ product.price.toFixed(2) }}</p>
              <button class="add-to-cart" type="button" @click.stop="addToCart(product)">Add to Cart</button>
            </div>
          </div>
        </div>

        <div v-if="processedProducts.length === 0" class="no-results">
          <p>No products match your selected filters</p>
          <button class="clear-all-btn" type="button" @click="clearFilters">Clear All Filters</button>
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <a href="#" @click.prevent="previousPage" v-if="currentPage > 1">&larr;</a>
          <a
            href="#"
            v-for="page in pages"
            :key="page"
            :class="{ active: currentPage === page }"
            @click.prevent="goToPage(page)"
          >
            {{ page }}
          </a>
          <a href="#" @click.prevent="nextPage" v-if="currentPage < totalPages">&rarr;</a>
        </div>
      </div>
    `
  };
