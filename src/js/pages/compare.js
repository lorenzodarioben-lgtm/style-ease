import { formatPrice, getProductStock } from '../utils/catalog-utils.js';
import ProductImage from '../components/product-image.js';

export default {
  name: 'ComparePage',
  components: {
    ProductImage
  },
  emits: ['add-to-cart', 'toggle-comparison'],
  props: {
    comparison: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  methods: {
    formatPrice: function (price) {
      return formatPrice(price);
    },
    getStockLabel: function (product) {
      return getProductStock(product) > 0 ? getProductStock(product) + ' available' : 'Unavailable';
    },
    removeProduct: function (product) {
      this.$emit('toggle-comparison', product);
    }
  },
  template: `
    <div class="container">
      <router-link to="/products" class="back-button">&larr; Back to Products</router-link>
      <h1 class="page-title">Compare Styles</h1>

      <section v-if="comparison.length" class="comparison-workspace" aria-labelledby="comparison-title">
        <p id="comparison-title">Compare up to three saved styles side by side.</p>
        <div class="comparison-products">
          <article v-for="product in comparison" :key="product.id" class="comparison-product">
            <product-image :src="product.image" :alt="product.name" image-class="comparison-image"></product-image>
            <h2>{{ product.name }}</h2>
            <div class="comparison-actions">
              <button class="add-to-cart-detail" type="button" :disabled="product.stock === 0" @click="$emit('add-to-cart', product)">
                {{ product.stock === 0 ? 'Unavailable' : 'Add to Bag' }}
              </button>
              <button class="remove-item" type="button" :aria-label="'Remove ' + product.name + ' from comparison'" @click="removeProduct(product)">
                Remove
              </button>
            </div>
          </article>
        </div>
        <div class="comparison-table-wrap" tabindex="0">
          <table class="comparison-table">
            <caption class="sr-only">Product comparison</caption>
            <thead>
              <tr>
                <th scope="col">Details</th>
                <th v-for="product in comparison" :key="'name-' + product.id" scope="col">
                  {{ product.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Price</th><td v-for="product in comparison" :key="'price-' + product.id">{{ formatPrice(product.price) }}</td></tr>
              <tr><th scope="row">Rating</th><td v-for="product in comparison" :key="'rating-' + product.id">{{ product.rating }} / 5</td></tr>
              <tr><th scope="row">Category</th><td v-for="product in comparison" :key="'category-' + product.id">{{ product.category }}</td></tr>
              <tr><th scope="row">Material</th><td v-for="product in comparison" :key="'material-' + product.id">{{ product.material }}</td></tr>
              <tr><th scope="row">Sizes</th><td v-for="product in comparison" :key="'sizes-' + product.id">{{ product.sizes.join(', ') }}</td></tr>
              <tr><th scope="row">Colors</th><td v-for="product in comparison" :key="'colors-' + product.id">{{ product.colors.join(', ') }}</td></tr>
              <tr><th scope="row">Demo stock</th><td v-for="product in comparison" :key="'stock-' + product.id">{{ getStockLabel(product) }}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="empty-cart" aria-live="polite">
        <p>Select up to three products in the catalogue to compare their details.</p>
        <router-link to="/products" class="hero-cta">Browse Products</router-link>
      </section>
    </div>
  `
};
