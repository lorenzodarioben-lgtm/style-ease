import { formatPrice } from '../utils/catalog-utils.js';

export default {
  name: 'OrdersPage',
  emits: ['clear-demo-data'],
  props: {
    orders: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data: function () {
    return {
      isClearConfirmationVisible: false
    };
  },
  methods: {
    cancelClearDemoData: function () {
      this.isClearConfirmationVisible = false;
    },
    confirmClearDemoData: function () {
      this.$emit('clear-demo-data');
      this.isClearConfirmationVisible = false;
    },
    formatPrice: function (price) {
      return formatPrice(price);
    },
    formatDate: function (dateValue) {
      var date = new Date(dateValue);

      return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
    }
  },
  template: `
    <div class="container">
      <router-link to="/products" class="back-button">&larr; Continue Shopping</router-link>
      <h1 class="page-title">Demo Order History</h1>
      <p class="order-history-note">Orders are stored only in this browser for portfolio demonstration purposes.</p>

      <section v-if="orders.length" class="order-history" aria-label="Demo order receipts">
        <details v-for="order in orders" :key="order.id" class="order-receipt">
          <summary>
            <span>{{ order.id }}</span>
            <span>{{ formatDate(order.createdAt) }}</span>
            <strong>{{ formatPrice(order.total) }}</strong>
          </summary>
          <div class="receipt-content">
            <h2>Receipt</h2>
            <p>Preferred payment: {{ order.paymentMethod }}</p>
            <p>Delivery: {{ order.customer.name }}, {{ order.customer.address }}, {{ order.customer.city }}, {{ order.customer.postcode }}</p>
            <ul>
              <li v-for="item in order.items" :key="item.id + item.selectedSize + item.selectedColor">
                {{ item.quantity }} × {{ item.name }} ({{ item.selectedSize }}, {{ item.selectedColor }}) — {{ formatPrice(item.price * item.quantity) }}
              </li>
            </ul>
            <p><strong>Total: {{ formatPrice(order.total) }}</strong></p>
          </div>
        </details>
      </section>

      <section v-else class="empty-cart" aria-live="polite">
        <p>Your simulated checkout receipts will appear here.</p>
        <router-link to="/products" class="hero-cta">Browse Products</router-link>
      </section>

      <section class="clear-demo-data" aria-labelledby="clear-demo-data-title">
        <h2 id="clear-demo-data-title">Clear saved demo data</h2>
        <p>Remove your cart, wishlist, comparisons, reviews, receipts, and entered delivery details from this browser.</p>
        <button class="remove-item" type="button" @click="isClearConfirmationVisible = true">Clear saved data</button>
        <div v-if="isClearConfirmationVisible" class="form-error" role="alert">
          <p>This cannot be undone.</p>
          <button class="back-checkout-btn" type="button" @click="cancelClearDemoData">Cancel</button>
          <button class="remove-item" type="button" @click="confirmClearDemoData">Clear data</button>
        </div>
      </section>
    </div>
  `
};
