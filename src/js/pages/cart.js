import {
  calculateCartQuantity,
  calculateCartTotal,
  formatPrice,
  getCartProductQuantity,
  getCartItemVariantKey,
  getProductStock,
  truncateText
} from '../utils/catalog-utils.js';
import ProductImage from '../components/product-image.js';

export default {
  name: 'CartPage',
  components: {
    ProductImage
  },
  props: {
    cart: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: ['remove-from-cart', 'update-cart-quantity'],
  computed: {
    cartItemCount: function () {
      return calculateCartQuantity(this.cart);
    },
    totalPrice: function () {
      return calculateCartTotal(this.cart);
    }
  },
  methods: {
    cartItemKey: function (item, index) {
      return getCartItemVariantKey(item) || String(index);
    },
    goToCheckout: function () {
      this.$router.push('/checkout');
    },
    removeFromCart: function (index) {
      this.$emit('remove-from-cart', index);
    },
    removeButtonLabel: function (item) {
      return 'Remove ' + item.name + ' from cart';
    },
    formatPrice: function (price) {
      return formatPrice(price);
    },
    truncate: function (text, length) {
      return truncateText(text, length);
    },
    updateQuantity: function (index, quantity) {
      this.$emit('update-cart-quantity', index, quantity);
    },
    quantityLimit: function (item, index) {
      return getProductStock(item) - getCartProductQuantity(this.cart, item.id, index);
    }
  },
  template: `
      <div class="container">
        <router-link to="/" class="back-button">&larr; Back to Home</router-link>
        <h1 class="page-title">Shopping Cart</h1>

        <div v-if="cart.length === 0" class="empty-cart" role="status">
          <p>Your cart is empty</p>
          <router-link to="/products" class="hero-cta">Continue Shopping</router-link>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items" role="list" aria-label="Cart items">
            <div class="cart-item" role="listitem" v-for="(item, index) in cart" :key="cartItemKey(item, index)">
              <div class="cart-item-image-container">
                <product-image :src="item.image" :alt="item.name" image-class="cart-item-image"></product-image>
              </div>

              <div class="cart-item-info">
                <h3>{{ truncate(item.name, 20) }}</h3>
                <p v-if="item.selectedColor">Color: {{ item.selectedColor }}</p>
                <p v-if="item.selectedSize">Size: {{ item.selectedSize }}</p>
                <p class="cart-item-price">{{ formatPrice(item.price) }} each</p>
              </div>

              <div class="quantity-control">
                <button
                  type="button"
                  :aria-label="'Decrease quantity of ' + item.name"
                  :disabled="item.quantity <= 1"
                  @click="updateQuantity(index, item.quantity - 1)"
                >
                  −
                </button>
                <label class="sr-only" :for="'cart-quantity-' + index">Quantity for {{ item.name }}</label>
                <input
                  :id="'cart-quantity-' + index"
                  type="number"
                  min="1"
                  :max="quantityLimit(item, index)"
                  :value="item.quantity"
                  @change="updateQuantity(index, $event.target.value)"
                >
                <button
                  type="button"
                  :aria-label="'Increase quantity of ' + item.name"
                  :disabled="item.quantity >= quantityLimit(item, index)"
                  @click="updateQuantity(index, item.quantity + 1)"
                >
                  +
                </button>
              </div>

              <p class="cart-item-total">{{ formatPrice(item.price * item.quantity) }}</p>

              <button
                class="remove-item"
                type="button"
                :aria-label="removeButtonLabel(item)"
                @click="removeFromCart(index)"
              >
                Remove
              </button>
            </div>
          </div>

          <section class="cart-summary" aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title">Order Summary</h2>
            <p>Total Items: {{ cartItemCount }}</p>
            <p>Total Price: {{ formatPrice(totalPrice) }}</p>
            <button class="checkout-btn" type="button" @click="goToCheckout">Proceed to Checkout</button>
          </section>
        </div>
      </div>
    `
};
