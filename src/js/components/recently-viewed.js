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
    },
    sectionId: {
      type: String,
      default: 'recently-viewed-title'
    },
    title: {
      type: String,
      default: 'Recently Viewed'
    }
  },
  methods: {
    formatPrice: function (price) {
      return formatPrice(price);
    }
  },
  template: `
    <section v-if="products.length" class="recently-viewed" :aria-labelledby="sectionId">
      <h2 :id="sectionId">{{ title }}</h2>
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
