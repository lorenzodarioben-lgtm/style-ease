import { formatPrice } from '../utils/catalog-utils.js';

export default {
  name: 'RecentlyViewed',
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
          <img :src="product.image" :alt="product.name">
          <span>{{ product.name }}</span>
          <strong>{{ formatPrice(product.price) }}</strong>
        </router-link>
      </div>
    </section>
  `
};
