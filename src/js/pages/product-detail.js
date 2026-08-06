import {
  createCartItem,
  createEmptyReview,
  createSelectedCartItem,
  findProductById,
  getCartProductQuantity,
  getDefaultSize,
  getProductStock,
  getReviewSummary,
  parseProductId,
  readReviews,
  saveReviews,
  sortReviews
} from '../utils/catalog-utils.js';
import { products } from '../data/catalog.js';
import RecentlyViewed from '../components/recently-viewed.js';
import ProductImage from '../components/product-image.js';

export default {
  name: 'ProductDetailPage',
  components: {
    ProductImage,
    RecentlyViewed
  },
  emits: [
    'add-to-cart',
    'add-to-wishlist',
    'remove-from-wishlist',
    'toggle-comparison',
    'view-product'
  ],
  props: {
    cart: {
      type: Array,
      default: function () {
        return [];
      }
    },
    comparison: {
      type: Array,
      default: function () {
        return [];
      }
    },
    recentlyViewed: {
      type: Array,
      default: function () {
        return [];
      }
    },
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
      reviewSort: 'newest',
      selectedColor: '',
      selectedQuantity: 1,
      selectedSize: '',
      showCare: false,
      showShipping: false,
      showSizeGuide: false
    };
  },
  created: function () {
    this.loadProduct();
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
    isWishlisted: function () {
      var product = this.product;

      return (
        Boolean(product) &&
        this.wishlist.some(function (item) {
          return item.id === product.id;
        })
      );
    },
    isCompared: function () {
      var product = this.product;

      return (
        Boolean(product) &&
        this.comparison.some(function (item) {
          return item.id === product.id;
        })
      );
    },
    recentAlternatives: function () {
      var currentProductId = this.product && this.product.id;

      return this.recentlyViewed.filter(function (item) {
        return item.id !== currentProductId;
      });
    },
    relatedStyles: function () {
      var product = this.product;

      if (!product) {
        return [];
      }

      var related = products.filter(function (candidate) {
        return candidate.id !== product.id && candidate.category === product.category;
      });
      var complementary = products.filter(function (candidate) {
        return candidate.id !== product.id && candidate.category !== product.category;
      });

      return related.concat(complementary).slice(0, 4);
    },
    orderedReviews: function () {
      return sortReviews(this.reviews, this.reviewSort);
    },
    reviewSummary: function () {
      return getReviewSummary(this.reviews);
    },
    quantityOptions: function () {
      return Array.from({ length: this.availableStock }, function (_, index) {
        return index + 1;
      });
    },
    wishlistLabel: function () {
      return this.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist';
    },
    comparisonLabel: function () {
      if (!this.product) {
        return 'Compare style';
      }

      return this.isCompared
        ? 'Remove ' + this.product.name + ' from comparison'
        : 'Add ' + this.product.name + ' to comparison';
    },
    stockLabel: function () {
      return this.availableStock > 0
        ? this.availableStock + ' available in this demo'
        : 'Out of stock in this demo';
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
        createCartItem(this.product, this.selectedSize, this.selectedColor, this.selectedQuantity)
      );
      this.selectedQuantity = 1;
    },
    loadProduct: function () {
      var productId = parseProductId(this.$route.params.id);
      var product = findProductById(productId);

      this.product = product || null;
      this.showCare = false;
      this.showShipping = false;
      this.showSizeGuide = false;
      this.newReview = createEmptyReview();
      this.reviewStatus = '';
      this.selectedQuantity = 1;

      if (!product) {
        this.reviews = [];
        this.selectedColor = '';
        this.selectedSize = '';
        return;
      }

      this.reviews = readReviews(product.id);
      this.selectedColor = product.colors[0] || '';
      this.selectedSize = getDefaultSize(product);
      this.$emit('view-product', product);
    },
    setRating: function (rating) {
      this.newReview.rating = rating;
      this.reviewStatus = 'Selected ' + rating + ' out of 5 stars.';
    },
    setSelectedSize: function (size) {
      this.selectedSize = size;
    },
    closeSizeGuide: function () {
      this.showSizeGuide = false;
    },
    openSizeGuide: function () {
      this.showSizeGuide = true;

      this.$nextTick(
        function () {
          var dialog = this.$refs.sizeGuide;

          if (!dialog || dialog.open) {
            return;
          }

          if (typeof dialog.showModal === 'function') {
            dialog.showModal();
          } else {
            dialog.setAttribute('open', '');
          }
        }.bind(this)
      );
    },
    submitReview: function () {
      if (!this.product || !this.newReview.rating) {
        return;
      }

      this.reviews = saveReviews(
        this.product.id,
        this.reviews.concat({
          rating: this.newReview.rating,
          comment: this.newReview.comment,
          createdAt: new Date().toISOString()
        })
      );
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
    toggleComparison: function () {
      if (this.product) {
        this.$emit('toggle-comparison', this.product);
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
            <product-image
              :src="product.image"
              :alt="product.name"
              image-class="product-detail-image-element"
              loading="eager"
              sizes="(max-width: 768px) 100vw, 50vw"
            ></product-image>
          </div>

          <div class="product-detail-info">
            <h1 class="product-detail-title">{{ product.name }}</h1>

            <div class="product-price-stock">
              <p class="product-detail-price">\${{ product.price }}</p>
              <span class="in-stock" :class="{ 'out-of-stock': availableStock === 0 }">{{ stockLabel }}</span>
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
                <button
                  class="size-guide-button"
                  type="button"
                  aria-haspopup="dialog"
                  @click="openSizeGuide"
                >
                  Find your size
                </button>
              </fieldset>

              <div class="option-group">
                <label :for="'product-color-' + product.id">Color:</label>
                <select :id="'product-color-' + product.id" v-model="selectedColor" class="option-select">
                  <option v-for="color in product.colors" :key="color" :value="color">
                    {{ color }}
                  </option>
                </select>
              </div>

              <div class="option-group">
                <label :for="'product-quantity-' + product.id">Quantity:</label>
                <select
                  :id="'product-quantity-' + product.id"
                  v-model.number="selectedQuantity"
                  class="option-select"
                  :disabled="availableStock === 0"
                >
                  <option v-for="quantity in quantityOptions" :key="quantity" :value="quantity">
                    {{ quantity }}
                  </option>
                </select>
              </div>
            </div>

            <div class="action-buttons">
              <button
                class="add-to-cart-detail"
                type="button"
                :disabled="availableStock === 0"
                @click="handleAddToCart"
              >
                {{ availableStock === 0 ? 'Unavailable' : 'Add to Bag' }}
              </button>

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

              <button
                class="compare-toggle"
                type="button"
                :aria-label="comparisonLabel"
                :aria-pressed="String(isCompared)"
                @click="toggleComparison"
              >
                {{ isCompared ? 'Remove from Compare' : 'Compare' }}
              </button>
            </div>

            <dialog
              v-if="showSizeGuide"
              ref="sizeGuide"
              class="size-guide-dialog"
              aria-labelledby="size-guide-title"
              @cancel.prevent="closeSizeGuide"
            >
              <div class="size-guide-content">
                <div class="size-guide-heading">
                  <h2 id="size-guide-title">Size guide</h2>
                  <button class="quick-shop-close" type="button" aria-label="Close size guide" @click="closeSizeGuide">&times;</button>
                </div>
                <p>Start with your usual size. If you are between sizes or prefer a more relaxed drape, choose the next size up.</p>
                <dl class="size-guide-notes">
                  <div>
                    <dt>Fitted layers</dt>
                    <dd>Choose your usual size for a close, structured fit.</dd>
                  </div>
                  <div>
                    <dt>Outerwear</dt>
                    <dd>Allow room for a knit or base layer when choosing your size.</dd>
                  </div>
                </dl>
                <p><strong>Available for this style:</strong> {{ product.sizes.join(', ') }}</p>
                <button class="back-checkout-btn" type="button" @click="closeSizeGuide">Done</button>
              </div>
            </dialog>

            <div class="product-description">
              <h2>Description</h2>
              <p>{{ product.details }}</p>

              <h2>Features</h2>
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
              <h2>Submit Your Review</h2>

              <form @submit.prevent="submitReview">
                <fieldset class="star-rating" aria-describedby="review-rating-help">
                  <legend>Your rating</legend>
                  <p id="review-rating-help" class="sr-only">Choose a rating from 1 to 5 stars.</p>
                  <div class="star-rating-controls">
                    <template v-for="star in 5" :key="star">
                      <input
                        :id="'review-rating-' + product.id + '-' + star"
                        v-model.number="newReview.rating"
                        class="sr-only rating-radio"
                        type="radio"
                        :name="'review-rating-' + product.id"
                        :value="star"
                        :aria-label="star + ' out of 5 stars'"
                        @change="setRating(star)"
                      >
                      <label
                        :for="'review-rating-' + product.id + '-' + star"
                        class="star"
                        :class="{ filled: star <= newReview.rating }"
                        aria-hidden="true"
                      >&#9733;</label>
                    </template>
                  </div>
                </fieldset>

                <label class="sr-only" :for="'review-comment-' + product.id">Review comment</label>
                <textarea
                  :id="'review-comment-' + product.id"
                  v-model="newReview.comment"
                  maxlength="500"
                  placeholder="Write your review here (optional)"
                  rows="3"
                ></textarea>

                <button class="submit-review-btn" type="submit" :disabled="!newReview.rating">Submit</button>
              </form>

              <p class="sr-only" role="status" aria-live="polite">{{ reviewStatus }}</p>
            </div>

            <div class="reviews-display" v-if="reviews.length > 0">
              <h2>Reviews</h2>
              <p class="review-summary" :aria-label="'Average rating ' + reviewSummary.average.toFixed(1) + ' out of 5 stars from ' + reviewSummary.count + ' reviews'">
                {{ reviewSummary.count }} review{{ reviewSummary.count === 1 ? '' : 's' }} · Average {{ reviewSummary.average.toFixed(1) }} / 5
              </p>
              <p class="review-local-note">Reviews are browser-local demo entries and are not verified purchases.</p>
              <label :for="'review-sort-' + product.id">
                Order reviews
                <select :id="'review-sort-' + product.id" v-model="reviewSort">
                  <option value="newest">Newest first</option>
                  <option value="highest-rating">Highest rating</option>
                </select>
              </label>
              <div class="review" v-for="(review, index) in orderedReviews" :key="review.createdAt || index">
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

        <recently-viewed
          :products="relatedStyles"
          section-id="related-styles-title"
          title="You may also like"
        ></recently-viewed>

        <recently-viewed
          :products="recentAlternatives"
          section-id="recently-viewed-title"
          title="Recently viewed"
        ></recently-viewed>
      </div>

      <div class="container" v-else>
        <router-link to="/products" class="back-button">&larr; Back to Products</router-link>
        <h1 class="page-title">Product Not Found</h1>
      </div>
    `
};
