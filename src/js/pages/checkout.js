import { calculateCartTotal, formatPrice } from '../utils/catalog-utils.js';

export default {
  name: 'CheckoutPage',
  props: {
    cart: {
      type: Array,
      default: function () {
        return [];
      }
    },
    orders: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: ['complete-order'],
  data: function () {
    return {
      address: '',
      city: '',
      email: '',
      fieldErrors: {},
      name: '',
      orderPlaced: false,
      paymentMethod: 'credit',
      postcode: '',
      step: 1,
      validationError: ''
    };
  },
  computed: {
    latestOrder: function () {
      return this.orders[0] || null;
    },
    totalPrice: function () {
      return calculateCartTotal(this.cart);
    }
  },
  methods: {
    formatPrice: function (price) {
      return formatPrice(price);
    },
    clearFieldError: function (field) {
      if (!this.fieldErrors[field]) {
        return;
      }

      var errors = Object.assign({}, this.fieldErrors);

      delete errors[field];
      this.fieldErrors = errors;

      if (Object.keys(errors).length === 0) {
        this.validationError = '';
      }
    },
    focusFirstError: function () {
      var firstField = Object.keys(this.fieldErrors)[0];

      if (!firstField || !this.$refs) {
        return;
      }

      this.$nextTick(
        function () {
          var field = this.$refs[firstField];

          if (field && typeof field.focus === 'function') {
            field.focus();
          }
        }.bind(this)
      );
    },
    getShippingErrors: function () {
      var errors = {};

      if (!this.name.trim()) {
        errors.name = 'Enter your full name.';
      }
      if (!/^\S+@\S+\.\S+$/.test(this.email.trim())) {
        errors.email = 'Enter a valid email address.';
      }
      if (!this.address.trim()) {
        errors.address = 'Enter your shipping address.';
      }
      if (!this.city.trim()) {
        errors.city = 'Enter your city or suburb.';
      }
      if (!this.postcode.trim()) {
        errors.postcode = 'Enter your postcode.';
      }

      return errors;
    },
    goToPayment: function () {
      this.fieldErrors = this.getShippingErrors();

      if (Object.keys(this.fieldErrors).length) {
        this.validationError = 'Please fix the highlighted shipping details.';
        this.focusFirstError();
        return false;
      }

      this.validationError = '';
      this.step = 2;
      return true;
    },
    returnToShipping: function () {
      this.step = 1;
      this.validationError = '';
    },
    placeOrder: function () {
      if (!this.cart.length) {
        this.validationError = 'Your bag is empty. Add a product before checking out.';
        return false;
      }

      this.validationError = '';
      this.orderPlaced = true;
      this.$emit('complete-order', {
        customer: {
          address: this.address.trim(),
          city: this.city.trim(),
          email: this.email.trim(),
          name: this.name.trim(),
          postcode: this.postcode.trim()
        },
        items: this.cart,
        paymentMethod: this.paymentMethod
      });
      return true;
    }
  },
  template: `
    <div class="container">
      <router-link to="/cart" class="back-button">&larr; Back to Cart</router-link>
      <h1 class="page-title">Checkout</h1>

      <div v-if="orderPlaced" class="order-confirmation" role="status" aria-live="polite">
        <h2>Order request received, {{ name }}.</h2>
        <p>This portfolio demonstration does not process payments or create real orders.</p>
        <p>Delivery details: {{ address }}, {{ city }}, {{ postcode }}</p>
        <p v-if="latestOrder"><strong>Demo receipt: {{ latestOrder.id }}</strong></p>
        <router-link
          v-if="latestOrder"
          :to="{ path: '/orders', query: { receipt: latestOrder.id } }"
          class="back-checkout-btn"
        >View Demo Receipt</router-link>
        <router-link to="/" class="hero-cta">Return to Home</router-link>
      </div>

      <form v-else class="checkout-form" novalidate @submit.prevent="step === 1 ? goToPayment() : placeOrder()">
        <ol class="checkout-steps" aria-label="Checkout progress">
          <li :class="{ active: step === 1 }" :aria-current="step === 1 ? 'step' : null">1. Shipping</li>
          <li :class="{ active: step === 2 }" :aria-current="step === 2 ? 'step' : null">2. Review</li>
        </ol>

        <p v-if="validationError" id="checkout-error" class="form-error" role="alert">{{ validationError }}</p>

        <fieldset v-if="step === 1" class="checkout-fieldset">
          <legend>Shipping details</legend>
          <p class="checkout-note">For demonstration only. Do not enter sensitive payment information.</p>

          <div class="form-section">
            <label for="checkout-name">Full name</label>
            <input id="checkout-name" ref="name" v-model="name" type="text" autocomplete="name" :aria-invalid="String(Boolean(fieldErrors.name))" :aria-describedby="fieldErrors.name ? 'checkout-name-error' : null" @input="clearFieldError('name')">
            <p v-if="fieldErrors.name" id="checkout-name-error" class="field-error">{{ fieldErrors.name }}</p>
          </div>

          <div class="form-section">
            <label for="checkout-email">Email</label>
            <input id="checkout-email" ref="email" v-model="email" type="email" autocomplete="email" :aria-invalid="String(Boolean(fieldErrors.email))" :aria-describedby="fieldErrors.email ? 'checkout-email-error' : null" @input="clearFieldError('email')">
            <p v-if="fieldErrors.email" id="checkout-email-error" class="field-error">{{ fieldErrors.email }}</p>
          </div>

          <div class="form-section">
            <label for="checkout-address">Street address</label>
            <textarea id="checkout-address" ref="address" v-model="address" autocomplete="street-address" :aria-invalid="String(Boolean(fieldErrors.address))" :aria-describedby="fieldErrors.address ? 'checkout-address-error' : null" @input="clearFieldError('address')"></textarea>
            <p v-if="fieldErrors.address" id="checkout-address-error" class="field-error">{{ fieldErrors.address }}</p>
          </div>

          <div class="checkout-location-grid">
            <div class="form-section">
              <label for="checkout-city">City or suburb</label>
              <input id="checkout-city" ref="city" v-model="city" type="text" autocomplete="address-level2" :aria-invalid="String(Boolean(fieldErrors.city))" :aria-describedby="fieldErrors.city ? 'checkout-city-error' : null" @input="clearFieldError('city')">
              <p v-if="fieldErrors.city" id="checkout-city-error" class="field-error">{{ fieldErrors.city }}</p>
            </div>
            <div class="form-section">
              <label for="checkout-postcode">Postcode</label>
              <input id="checkout-postcode" ref="postcode" v-model="postcode" type="text" autocomplete="postal-code" :aria-invalid="String(Boolean(fieldErrors.postcode))" :aria-describedby="fieldErrors.postcode ? 'checkout-postcode-error' : null" @input="clearFieldError('postcode')">
              <p v-if="fieldErrors.postcode" id="checkout-postcode-error" class="field-error">{{ fieldErrors.postcode }}</p>
            </div>
          </div>

          <button class="checkout-btn" type="submit">Continue to Review</button>
        </fieldset>

        <section v-else aria-labelledby="review-order-title">
          <h2 id="review-order-title">Review your request</h2>
          <div class="form-section">
            <label for="checkout-payment">Preferred payment method</label>
            <select id="checkout-payment" v-model="paymentMethod" autocomplete="cc-type">
              <option value="credit">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="applepay">Apple Pay</option>
            </select>
          </div>
          <div class="order-summary">
            <h3>Order Summary</h3>
            <ul>
              <li v-for="item in cart" :key="item.id + item.selectedSize + item.selectedColor">
                {{ item.quantity }} × {{ item.name }} — {{ formatPrice(item.price * item.quantity) }}
              </li>
            </ul>
            <p><strong>Total: {{ formatPrice(totalPrice) }}</strong></p>
          </div>
          <div class="checkout-navigation">
            <button class="back-checkout-btn" type="button" @click="returnToShipping">Back</button>
            <button class="checkout-btn" type="submit">Confirm Demo Order</button>
          </div>
        </section>
      </form>
    </div>
  `
};
