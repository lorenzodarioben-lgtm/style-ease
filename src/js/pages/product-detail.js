import {
  createEmptyReview,
  createSelectedCartItem,
  findProductById,
  getDefaultSize,
  readReviews,
  saveReviews
} from '../utils/catalog-utils.js';

export default {
  name: 'ProductDetailPage',
  emits: ['add-to-cart', 'add-to-wishlist', 'remove-from-wishlist'],
  props: {
    wishlist: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data: function () {
    return {
      newReview: createEmptyReview(),
      product: null,
      reviewStatus: '',
      reviews: [],
      selectedColor: '',
      selectedSize: '',
      showCare: false,
      showShipping: false
    };
  },
  created: function () {
    this.loadProduct();
  },
  computed: {
    isWishlisted: function () {
      var product = this.product;

      return (
        Boolean(product) &&
        this.wishlist.some(function (item) {
          return item.id === product.id;
        })
      );
    },
    wishlistLabel: function () {
      return this.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist';
    }
  },
  watch: {
    '$route.params.id': function () {
      this.loadProduct();
    }
  },
  methods: {
    handleAddToCart: function () {
      if (!this.product) {
        return;
      }

      this.$emit(
        'add-to-cart',
        createSelectedCartItem(this.product, this.selectedSize, this.selectedColor)
      );
    },
    loadProduct: function () {
      var productId = Number.parseInt(this.$route.params.id, 10);
      var product = findProductById(productId);

      this.product = product || null;
      this.showCare = false;
      this.showShipping = false;
      this.newReview = createEmptyReview();
      this.reviewStatus = '';

      if (!product) {
        this.reviews = [];
        this.selectedColor = '';
        this.selectedSize = '';
        return;
      }

      this.reviews = readReviews(product.id);
      this.selectedColor = product.colors[0] || '';
      this.selectedSize = getDefaultSize(product);
    },
    setRating: function (rating) {
      this.newReview.rating = rating;
      this.reviewStatus = 'Selected ' + rating + ' out of 5 stars.';
    },
    setSelectedSize: function (size) {
      this.selectedSize = size;
    },
    submitReview: function () {
      if (!this.product || !this.newReview.rating) {
        return;
      }

      this.reviews.push({
        rating: this.newReview.rating,
        comment: this.newReview.comment.trim()
      });
      saveReviews(this.product.id, this.reviews);
      this.newReview = createEmptyReview();
      this.reviewStatus = 'Review submitted.';
    },
    toggleAccordion: function (section) {
      if (section === 'shipping') {
        this.showShipping = !this.showShipping;
        return;
      }

      if (section === 'care') {
        this.showCare = !this.showCare;
      }
    },
    toggleWishlist: function () {
      if (!this.product) {
        return;
      }

      if (this.isWishlisted) {
        this.$emit('remove-from-wishlist', this.product.id);
        return;
      }

      this.$emit(
        'add-to-wishlist',
        createSelectedCartItem(this.product, this.selectedSize, this.selectedColor)
      );
    }
  },
  template: `
      <div class="container" v-if="product">
        <router-link to="/products" class="back-button">&larr; Back to Products</router-link>

        <div class="product-detail">
          <div class="product-detail-image">
            <img :src="product.image" :alt="product.name">
          </div>

          <div class="product-detail-info">
            <h1 class="product-detail-title">{{ product.name }}</h1>

            <div class="product-price-stock">
              <p class="product-detail-price">\${{ product.price }}</p>
              <span class="in-stock">In Stock</span>
            </div>

            <div class="product-options">
              <fieldset class="option-group">
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

              <div class="option-group">
                <label :for="'product-color-' + product.id">Color:</label>
                <select :id="'product-color-' + product.id" v-model="selectedColor" class="option-select">
                  <option v-for="color in product.colors" :key="color" :value="color">
                    {{ color }}
                  </option>
                </select>
              </div>
            </div>

            <div class="action-buttons">
              <button class="add-to-cart-detail" type="button" @click="handleAddToCart">Add to Bag</button>

              <button
                class="wishlist-btn"
                type="button"
                :class="{ liked: isWishlisted }"
                :aria-label="wishlistLabel"
                :aria-pressed="String(isWishlisted)"
                @click="toggleWishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5
                    5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
              </button>
            </div>

            <div class="product-description">
              <h3>Description</h3>
              <p>{{ product.details }}</p>

              <h3>Features</h3>
              <ul class="feature-list">
                <li>Premium quality material</li>
                <li>Geometric design elements</li>
                <li>Modern architectural aesthetic</li>
                <li>Sustainable production</li>
              </ul>
            </div>

            <div class="accordion-group">
              <div class="accordion-item">
                <button
                  class="accordion-title"
                  type="button"
                  :aria-expanded="String(showShipping)"
                  :aria-controls="'shipping-content-' + product.id"
                  @click="toggleAccordion('shipping')"
                >
                  Shipping & Returns
                  <span aria-hidden="true">{{ showShipping ? '-' : '+' }}</span>
                </button>
                <div :id="'shipping-content-' + product.id" class="accordion-content" v-show="showShipping">
                  <p>We offer free worldwide shipping. Returns are accepted within 30 days of purchase.</p>
                </div>
              </div>

              <div class="accordion-item">
                <button
                  class="accordion-title"
                  type="button"
                  :aria-expanded="String(showCare)"
                  :aria-controls="'care-content-' + product.id"
                  @click="toggleAccordion('care')"
                >
                  Care Instructions
                  <span aria-hidden="true">{{ showCare ? '-' : '+' }}</span>
                </button>
                <div :id="'care-content-' + product.id" class="accordion-content" v-show="showCare">
                  <p>Machine wash cold with like colors. Tumble dry low or hang dry. Do not bleach.</p>
                </div>
              </div>
            </div>

            <div class="review-section">
              <h3>Submit Your Review</h3>

              <form @submit.prevent="submitReview">
                <fieldset class="star-rating" aria-describedby="review-rating-help">
                  <legend>Your rating</legend>
                  <p id="review-rating-help" class="sr-only">Choose a rating from 1 to 5 stars.</p>
                  <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="star"
                  :class="{ filled: star <= newReview.rating }"
                  :aria-label="'Rate ' + star + ' star'"
                  :aria-pressed="String(star === newReview.rating)"
                  @click="setRating(star)"
                >&#9733;</button>
                </fieldset>

                <label class="sr-only" :for="'review-comment-' + product.id">Review comment</label>
                <textarea
                  :id="'review-comment-' + product.id"
                  v-model="newReview.comment"
                  placeholder="Write your review here (optional)"
                  rows="3"
                ></textarea>

                <button class="submit-review-btn" type="submit" :disabled="!newReview.rating">Submit</button>
              </form>

              <p class="sr-only" role="status" aria-live="polite">{{ reviewStatus }}</p>
            </div>

            <div class="reviews-display" v-if="reviews.length > 0">
              <h3>Reviews</h3>
              <div class="review" v-for="(review, index) in reviews" :key="index">
                <p class="sr-only">{{ review.rating }} out of 5 stars</p>
                <div class="review-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ filled: star <= review.rating }"
                    aria-hidden="true"
                  >&#9733;</span>
                </div>
                <p class="review-comment" v-if="review.comment">{{ review.comment }}</p>
                <hr>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container" v-else>
        <router-link to="/products" class="back-button">&larr; Back to Products</router-link>
        <h1 class="page-title">Product Not Found</h1>
      </div>
    `
};
