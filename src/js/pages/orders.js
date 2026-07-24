import { formatPrice } from '../utils/catalog-utils.js';

export default {
  name: 'OrdersPage',
  props: {
    orders: {
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
    </div>
  `
};
