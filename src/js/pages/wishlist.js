import { formatPrice } from '../utils/catalog-utils.js';
import ProductImage from '../components/product-image.js';

export default {
  name: 'WishlistPage',
  components: {
    ProductImage
  },
  emits: ['move-wishlist-item-to-cart', 'remove-from-wishlist'],
  props: {
    wishlist: {
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
    moveToBag: function (product) {
      this.$emit('move-wishlist-item-to-cart', product);
    },
    removeFromWishlist: function (productId) {
      this.$emit('remove-from-wishlist', productId);
    }
  },
  template: `
    <div class="container">
      <router-link to="/products" class="back-button">&larr; Continue Shopping</router-link>
      <h1 class="page-title">Wishlist</h1>

      <section v-if="wishlist.length" aria-labelledby="wishlist-title">
        <p id="wishlist-title" class="wishlist-intro">{{ wishlist.length }} saved style{{ wishlist.length === 1 ? '' : 's' }}</p>
        <div class="wishlist-grid">
          <article v-for="product in wishlist" :key="product.id" class="wishlist-card">
            <router-link :to="'/product/' + product.id" :aria-label="'View ' + product.name">
              <product-image :src="product.image" :alt="product.name" image-class="wishlist-image"></product-image>
            </router-link>
            <div class="wishlist-card-content">
              <h2><router-link :to="'/product/' + product.id">{{ product.name }}</router-link></h2>
              <p>{{ formatPrice(product.price) }}</p>
              <div class="wishlist-actions">
                <button type="button" class="add-to-cart-detail" :disabled="product.stock === 0" @click="moveToBag(product)">
                  {{ product.stock === 0 ? 'Unavailable' : 'Move to Bag' }}
                </button>
                <button type="button" class="remove-item" :aria-label="'Remove ' + product.name + ' from wishlist'" @click="removeFromWishlist(product.id)">
                  Remove
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-else class="empty-cart wishlist-empty" aria-live="polite">
        <p>Your wishlist is ready for inspiration.</p>
        <router-link to="/products" class="hero-cta">Explore the Collection</router-link>
      </section>
    </div>
  `
};
