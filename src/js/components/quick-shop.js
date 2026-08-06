import {
  createCartItem,
  getCartProductQuantity,
  getDefaultSize,
  getProductStock
} from '../utils/catalog-utils.js';

export default {
  name: 'QuickShop',
  emits: ['add-to-cart', 'close'],
  props: {
    cart: {
      type: Array,
      default: function () {
        return [];
      }
    },
    product: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      selectedColor: '',
      selectedQuantity: 1,
      selectedSize: ''
    };
  },
  computed: {
    availableStock: function () {
      return this.product
        ? Math.max(
            0,
            getProductStock(this.product) - getCartProductQuantity(this.cart, this.product.id)
          )
        : 0;
    },
    quantityOptions: function () {
      return Array.from({ length: this.availableStock }, function (_, index) {
        return index + 1;
      });
    }
  },
  created: function () {
    this.resetSelection();
  },
  mounted: function () {
    this.openDialog();
  },
  methods: {
    close: function () {
      this.$emit('close');
    },
    handleAddToCart: function () {
      if (!this.product || this.availableStock === 0) {
        return;
      }

      this.$emit(
        'add-to-cart',
        createCartItem(this.product, this.selectedSize, this.selectedColor, this.selectedQuantity)
      );
      this.close();
    },
    openDialog: function () {
      var dialog = this.$refs.dialog;

      if (!dialog || dialog.open) {
        return;
      }

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    },
    resetSelection: function () {
      this.selectedColor = (this.product && this.product.colors[0]) || '';
      this.selectedSize = this.product ? getDefaultSize(this.product) : '';
      this.selectedQuantity = 1;
    },
    setSelectedSize: function (size) {
      this.selectedSize = size;
    }
  },
  template: `
    <dialog
      ref="dialog"
      class="quick-shop-dialog"
      aria-labelledby="quick-shop-title"
      @cancel.prevent="close"
    >
      <div v-if="product" class="quick-shop-content">
        <div class="quick-shop-heading">
          <p>Quick shop</p>
          <button class="quick-shop-close" type="button" aria-label="Close quick shop" @click="close">&times;</button>
        </div>
        <h2 id="quick-shop-title">{{ product.name }}</h2>
        <p class="quick-shop-price">\${{ product.price }}</p>
        <p class="quick-shop-stock" :class="{ 'out-of-stock': availableStock === 0 }">
          {{ availableStock > 0 ? availableStock + ' available in this demo' : 'Out of stock in this demo' }}
        </p>

        <fieldset class="quick-shop-options">
          <legend>Size</legend>
          <div class="size-buttons">
            <button
              v-for="size in product.sizes"
              :key="size"
              type="button"
              :class="{ selected: selectedSize === size }"
              :aria-pressed="String(selectedSize === size)"
              @click="setSelectedSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </fieldset>

        <label :for="'quick-shop-color-' + product.id">Color</label>
        <select :id="'quick-shop-color-' + product.id" v-model="selectedColor" class="option-select">
          <option v-for="color in product.colors" :key="color" :value="color">{{ color }}</option>
        </select>

        <label :for="'quick-shop-quantity-' + product.id">Quantity</label>
        <select
          :id="'quick-shop-quantity-' + product.id"
          v-model.number="selectedQuantity"
          class="option-select"
          :disabled="availableStock === 0"
        >
          <option v-for="quantity in quantityOptions" :key="quantity" :value="quantity">{{ quantity }}</option>
        </select>

        <button
          class="add-to-cart-detail"
          type="button"
          :disabled="availableStock === 0"
          @click="handleAddToCart"
        >
          {{ availableStock === 0 ? 'Unavailable' : 'Add to Bag' }}
        </button>
      </div>
    </dialog>
  `
};
