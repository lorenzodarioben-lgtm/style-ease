import { calculateCartTotal, formatPrice, truncateText } from '../utils/catalog-utils.js';

export default {
  name: 'CartPage',
  props: {
    cart: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: ['remove-from-cart'],
  computed: {
    totalPrice: function () {
      return calculateCartTotal(this.cart);
    }
  },
  methods: {
    cartItemKey: function (item, index) {
      return [item.id, item.selectedSize, item.selectedColor, index].filter(Boolean).join('-');
    },
    goToCheckout: function () {
      this.$router.push('/checkout');
    },
    removeFromCart: function (index) {
      this.$emit('remove-from-cart', index);
    },
    formatPrice: function (price) {
      return formatPrice(price);
    },
    truncate: function (text, length) {
      return truncateText(text, length);
    }
  },
  template: `
      <div class="container">
        <router-link to="/" class="back-button">&larr; Back to Home</router-link>
        <h1 class="page-title">Shopping Cart</h1>

        <div v-if="cart.length === 0" class="empty-cart">
          <p>Your cart is empty</p>
          <router-link to="/products" class="hero-cta">Continue Shopping</router-link>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items">
            <div class="cart-item" v-for="(item, index) in cart" :key="cartItemKey(item, index)">
              <div class="cart-item-image-container">
                <img :src="item.image" :alt="item.name" class="cart-item-image">
              </div>

              <div class="cart-item-info">
                <h3>{{ truncate(item.name, 20) }}</h3>
                <p v-if="item.selectedColor">Color: {{ item.selectedColor }}</p>
                <p v-if="item.selectedSize">Size: {{ item.selectedSize }}</p>
                <p class="cart-item-price">{{ formatPrice(item.price) }}</p>
              </div>

              <button class="remove-item" type="button" @click="removeFromCart(index)">Remove</button>
            </div>
          </div>

          <div class="cart-summary">
            <h3>Order Summary</h3>
            <p>Total Items: {{ cart.length }}</p>
            <p>Total Price: {{ formatPrice(totalPrice) }}</p>
            <button class="checkout-btn" type="button" @click="goToCheckout">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    `
};
