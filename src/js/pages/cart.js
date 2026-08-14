import {
  calculateCartQuantity,
  calculateCartTotal,
  formatPrice,
  getCartProductQuantity,
  getCartItemQuantity,
  getCartItemVariantKey,
  getProductStock,
  truncateText
} from '../utils/catalog-utils.js';
import DeliveryProgress from '../components/delivery-progress.js';
import ProductImage from '../components/product-image.js';

export default {
  name: 'CartPage',
  components: {
    DeliveryProgress,
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
  emits: ['remove-from-cart', 'save-cart-item-for-later', 'update-cart-quantity'],
  data: function () {
    return {
      cartStatus: ''
    };
  },
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
      var item = this.cart[index];

      if (item) {
        this.cartStatus = item.name + ' removed from your cart.';
      }

      this.$emit('remove-from-cart', index);
      this.focusAfterRemoval(index);
    },
    saveForLater: function (index) {
      var item = this.cart[index];

      if (item) {
        this.$emit('save-cart-item-for-later', index);
      }
    },
    removeButtonLabel: function (item) {
      return 'Remove ' + item.name + ' from cart';
    },
    formatPrice: function (price) {
      return formatPrice(price);
    },
    focusAfterRemoval: function (removedIndex) {
      this.$nextTick(
        function () {
          var targetIndex = Math.min(removedIndex, this.cart.length - 1);
          var nextAction =
            targetIndex >= 0 && this.$refs
              ? this.$refs['remove-cart-item-' + targetIndex]
              : this.$refs && this.$refs.emptyCart;

          if (Array.isArray(nextAction)) {
            nextAction = nextAction[0];
          }

          if (nextAction && typeof nextAction.focus === 'function') {
            nextAction.focus();
          }
        }.bind(this)
      );
    },
    truncate: function (text, length) {
      return truncateText(text, length);
    },
    updateQuantity: function (index, quantity) {
      var item = this.cart[index];

      if (!item) {
        return;
      }

      var quantityLimit = this.quantityLimit(item, index);

      if (quantityLimit < 1) {
        return;
      }

      var nextQuantity = Math.min(getCartItemQuantity({ quantity: quantity }), quantityLimit);
      var nextCart = this.cart.map(function (cartItem, cartIndex) {
        return cartIndex === index
          ? Object.assign({}, cartItem, { quantity: nextQuantity })
          : cartItem;
      });

      this.$emit('update-cart-quantity', index, nextQuantity);
      this.cartStatus =
        item.name +
        ' quantity updated to ' +
        nextQuantity +
        '. Cart total ' +
        formatPrice(calculateCartTotal(nextCart)) +
        '.';
    },
    quantityLimit: function (item, index) {
      return getProductStock(item) - getCartProductQuantity(this.cart, item.id, index);
    },
    availabilityLabel: function (item, index) {
      var quantityLimit = this.quantityLimit(item, index);
      var itemLabel = quantityLimit === 1 ? 'item' : 'items';

      return (
        quantityLimit + ' demo ' + itemLabel + ' can be held across all selections of this style.'
      );
    }
  },
  template: `
      <div class="container">
        <router-link to="/" class="back-button">&larr; Back to Home</router-link>
        <h1 class="page-title">Shopping Cart</h1>
        <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ cartStatus }}</p>

        <div v-if="cart.length === 0" ref="emptyCart" class="empty-cart" role="status" tabindex="-1">
          <p>Your cart is empty</p>
          <router-link to="/products" class="hero-cta">Continue Shopping</router-link>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items" role="list" aria-label="Cart items">
            <div class="cart-item" role="listitem" v-for="(item, index) in cart" :key="cartItemKey(item, index)">
              <div class="cart-item-image-container">
                <router-link :to="'/product/' + item.id" :aria-label="'View ' + item.name + ' details'">
                  <product-image :src="item.image" :alt="item.name" image-class="cart-item-image"></product-image>
                </router-link>
              </div>

              <div class="cart-item-info">
                <h2><router-link :to="'/product/' + item.id">{{ truncate(item.name, 20) }}</router-link></h2>
                <p v-if="item.selectedColor">Color: {{ item.selectedColor }}</p>
                <p v-if="item.selectedSize">Size: {{ item.selectedSize }}</p>
                <p class="cart-item-price">{{ formatPrice(item.price) }} each</p>
                <p :id="'cart-availability-' + index" class="cart-item-availability">{{ availabilityLabel(item, index) }}</p>
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
                  inputmode="numeric"
                  :aria-describedby="'cart-availability-' + index"
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
                :ref="'remove-cart-item-' + index"
                :aria-label="removeButtonLabel(item)"
                @click="removeFromCart(index)"
              >
                Remove
              </button>
              <button
                class="save-for-later"
                type="button"
                :aria-label="'Save ' + item.name + ' for later'"
                @click="saveForLater(index)"
              >
                Save for later
              </button>
            </div>
          </div>

          <section class="cart-summary" aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title">Order Summary</h2>
            <p>Total Items: {{ cartItemCount }}</p>
            <p>Total Price: {{ formatPrice(totalPrice) }}</p>
            <delivery-progress :current-step="1"></delivery-progress>
            <button class="checkout-btn" type="button" @click="goToCheckout">Proceed to Checkout</button>
          </section>
        </div>
      </div>
    `
};
