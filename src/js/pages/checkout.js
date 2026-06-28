import { calculateCartTotal, formatPrice } from '../utils/catalog-utils.js';

export default {
  name: 'CheckoutPage',
  props: {
    cart: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: ['clear-cart'],
  data: function () {
    return {
      address: '',
      name: '',
      orderPlaced: false,
      paymentMethod: 'credit',
      validationError: ''
    };
  },
  computed: {
    totalPrice: function () {
      return calculateCartTotal(this.cart);
    }
  },
  methods: {
    formatPrice: function (price) {
      return formatPrice(price);
    },
    notifyValidationError: function (message) {
      this.validationError = message;
    },
    placeOrder: function () {
      var isNameMissing = !this.name.trim();
      var isAddressMissing = !this.address.trim();

      if (isNameMissing || isAddressMissing) {
        this.notifyValidationError('Please enter your name and shipping address.');
        return;
      }

      this.validationError = '';
      this.orderPlaced = true;
      this.$emit('clear-cart');
    }
  },
  template: `
    <div class="container">
      <router-link to="/cart" class="back-button">&larr; Back to Cart</router-link>
      <h1 class="page-title">Checkout</h1>

      <div v-if="orderPlaced" class="order-confirmation" role="status" aria-live="polite">
        <h2>Thank you for your order, {{ name }}!</h2>
        <p>Your items will be shipped to:</p>
        <p>{{ address }}</p>
        <router-link to="/" class="hero-cta">Return to Home</router-link>
      </div>

      <form v-else class="checkout-form" novalidate @submit.prevent="placeOrder">
        <p v-if="validationError" id="checkout-error" class="form-error" role="alert">
          {{ validationError }}
        </p>

        <div class="form-section">
          <label for="checkout-name">Name:</label>
          <input
            id="checkout-name"
            v-model="name"
            type="text"
            placeholder="Your Name"
            autocomplete="name"
            required
            :aria-invalid="String(Boolean(validationError && !name.trim()))"
            :aria-describedby="validationError && !name.trim() ? 'checkout-error' : null"
          >
        </div>

        <div class="form-section">
          <label for="checkout-address">Shipping Address:</label>
          <textarea
            id="checkout-address"
            v-model="address"
            placeholder="123 Main St, City, Country"
            autocomplete="street-address"
            required
            :aria-invalid="String(Boolean(validationError && !address.trim()))"
            :aria-describedby="validationError && !address.trim() ? 'checkout-error' : null"
          ></textarea>
        </div>

        <div class="form-section">
          <label for="checkout-payment">Payment Method:</label>
          <select id="checkout-payment" v-model="paymentMethod" autocomplete="cc-type">
            <option value="credit">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="applepay">Apple Pay</option>
          </select>
        </div>

        <div class="order-summary">
          <h3>Order Summary</h3>
          <ul>
            <li v-for="(item, index) in cart" :key="index">
              {{ item.name }} - {{ formatPrice(item.price) }}
            </li>
          </ul>
          <p><strong>Total: {{ formatPrice(totalPrice) }}</strong></p>
        </div>

        <button class="checkout-btn" type="submit">Place Order</button>
      </form>
    </div>
  `
};
