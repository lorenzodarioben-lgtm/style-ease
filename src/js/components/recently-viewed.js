import { formatPrice } from '../utils/catalog-utils.js';
import ProductImage from './product-image.js';

export default {
  name: 'RecentlyViewed',
  components: {
    ProductImage
  },
  props: {
    products: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  methods: {
    formatPrice: function (price) {
      return formatPrice(price);
    }
  },
  template: `
    <section v-if="products.length" class="recently-viewed" aria-labelledby="recently-viewed-title">
      <h2 id="recently-viewed-title">Recently Viewed</h2>
      <div class="recently-viewed-grid">
        <router-link v-for="product in products" :key="product.id" :to="'/product/' + product.id" class="recently-viewed-card">
          <product-image :src="product.image" :alt="product.name"></product-image>
          <span>{{ product.name }}</span>
          <strong>{{ formatPrice(product.price) }}</strong>
        </router-link>
      </div>
    </section>
  `
};
