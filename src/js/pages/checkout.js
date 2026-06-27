(function (StyleEase) {
  'use strict';

  StyleEase.pages = StyleEase.pages || {};

  StyleEase.pages.Checkout = {
    props: {
      cart: {
        type: Array,
        default: function () {
          return [];
        }
      }
    },
    data: function () {
      return {
        address: '',
        name: '',
        orderPlaced: false,
        paymentMethod: 'credit'
      };
    },
    computed: {
      totalPrice: function () {
        return this.cart.reduce(function (total, item) {
          return total + item.price;
        }, 0);
      }
    },
    methods: {
      placeOrder: function () {
        if (!this.name.trim() || !this.address.trim()) {
          alert('Please fill in all fields.');
          return;
        }

        this.orderPlaced = true;
        this.$emit('clear-cart');
      }
    },
    template: `
      <div class="container">
        <router-link to="/cart" class="back-button">&larr; Back to Cart</router-link>
        <h1 class="page-title">Checkout</h1>

        <div v-if="orderPlaced" class="order-confirmation">
          <h2>Thank you for your order, {{ name }}!</h2>
          <p>Your items will be shipped to:</p>
          <p>{{ address }}</p>
          <router-link to="/" class="hero-cta">Return to Home</router-link>
        </div>

        <div v-else class="checkout-form">
          <div class="form-section">
            <label>Name:</label>
            <input v-model="name" type="text" placeholder="Your Name">
          </div>

          <div class="form-section">
            <label>Shipping Address:</label>
            <textarea v-model="address" placeholder="123 Main St, City, Country"></textarea>
          </div>

          <div class="form-section">
            <label>Payment Method:</label>
            <select v-model="paymentMethod">
              <option value="credit">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="applepay">Apple Pay</option>
            </select>
          </div>

          <div class="order-summary">
            <h3>Order Summary</h3>
            <ul>
              <li v-for="(item, index) in cart" :key="index">
                {{ item.name }} - \${{ item.price.toFixed(2) }}
              </li>
            </ul>
            <p><strong>Total: \${{ totalPrice.toFixed(2) }}</strong></p>
          </div>

          <button class="checkout-btn" type="button" @click="placeOrder">Place Order</button>
        </div>
      </div>
    `
  };
}(window.StyleEase = window.StyleEase || {}));
