(function (StyleEase) {
  'use strict';

  StyleEase.pages = StyleEase.pages || {};

  StyleEase.pages.Cart = {
    props: {
      cart: {
        type: Array,
        default: function () {
          return [];
        }
      }
    },
    computed: {
      totalPrice: function () {
        return this.cart.reduce(function (total, item) {
          return total + item.price;
        }, 0);
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
                <h3>{{ item.name | truncate(20) }}</h3>
                <p v-if="item.selectedColor">Color: {{ item.selectedColor }}</p>
                <p v-if="item.selectedSize">Size: {{ item.selectedSize }}</p>
                <p class="cart-item-price">\${{ item.price.toFixed(2) }}</p>
              </div>

              <button class="remove-item" type="button" @click="removeFromCart(index)">Remove</button>
            </div>
          </div>

          <div class="cart-summary">
            <h3>Order Summary</h3>
            <p>Total Items: {{ cart.length }}</p>
            <p>Total Price: \${{ totalPrice.toFixed(2) }}</p>
            <button class="checkout-btn" type="button" @click="goToCheckout">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    `
  };
}(window.StyleEase = window.StyleEase || {}));
