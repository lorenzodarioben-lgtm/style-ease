import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import ProductDetailPage from './product-detail.js';

describe('product detail accessibility state', function () {
  it('reports wishlist state and accessible button text', function () {
    var product = products[0];
    var context = {
      product: product,
      wishlist: [product]
    };

    expect(ProductDetailPage.computed.isWishlisted.call(context)).toBe(true);
    expect(ProductDetailPage.computed.wishlistLabel.call({ isWishlisted: true })).toBe(
      'Remove from wishlist'
    );

    context.wishlist = [];

    expect(ProductDetailPage.computed.isWishlisted.call(context)).toBe(false);
    expect(ProductDetailPage.computed.wishlistLabel.call({ isWishlisted: false })).toBe(
      'Add to wishlist'
    );
  });

  it('exposes add and remove comparison controls for the current product', function () {
    var emit = vi.fn();
    var product = products[0];

    expect(
      ProductDetailPage.computed.isCompared.call({ comparison: [product], product: product })
    ).toBe(true);
    expect(
      ProductDetailPage.computed.comparisonLabel.call({
        isCompared: false,
        product: product
      })
    ).toBe('Add Geometric T-Shirt to comparison');

    ProductDetailPage.methods.toggleComparison.call({ $emit: emit, product: product });

    expect(emit).toHaveBeenCalledWith('toggle-comparison', product);
    expect(ProductDetailPage.template).toContain(':aria-pressed="String(isCompared)"');
  });

  it('updates selected rating and review status through production methods', function () {
    var context = {
      newReview: {
        rating: 0,
        comment: ''
      },
      reviewStatus: ''
    };

    ProductDetailPage.methods.setRating.call(context, 4);

    expect(context.newReview.rating).toBe(4);
    expect(context.reviewStatus).toBe('Selected 4 out of 5 stars.');
  });

  it('uses native labelled rating radios rather than toggle buttons', function () {
    expect(ProductDetailPage.template).toContain('type="radio"');
    expect(ProductDetailPage.template).toContain("star + ' out of 5 stars'");
    expect(ProductDetailPage.template).toContain('v-model.number="newReview.rating"');
    expect(ProductDetailPage.template).not.toContain("'Rate ' + star + ' star'");
  });

  it('describes browser-local review summaries and offers accessible ordering', function () {
    expect(ProductDetailPage.template).toContain('Reviews are browser-local demo entries');
    expect(ProductDetailPage.template).toContain('Order reviews');
    expect(ProductDetailPage.template).toContain('value="highest-rating"');
    expect(ProductDetailPage.computed.reviewSummary.call({ reviews: [{ rating: 4 }] })).toEqual({
      average: 4,
      count: 1
    });
  });

  it('updates selected size through the button handler', function () {
    var context = {
      selectedSize: 'S'
    };

    ProductDetailPage.methods.setSelectedSize.call(context, 'L');

    expect(context.selectedSize).toBe('L');
  });

  it('opens and closes the size guide with a native dialog fallback', function () {
    var dialog = {
      open: false,
      setAttribute: vi.fn()
    };
    var context = {
      $nextTick: function (callback) {
        callback();
      },
      $refs: { sizeGuide: dialog },
      showSizeGuide: false
    };

    ProductDetailPage.methods.openSizeGuide.call(context);

    expect(context.showSizeGuide).toBe(true);
    expect(dialog.setAttribute).toHaveBeenCalledWith('open', '');
    ProductDetailPage.methods.closeSizeGuide.call(context);
    expect(context.showSizeGuide).toBe(false);
    expect(ProductDetailPage.template).toContain('aria-haspopup="dialog"');
  });

  it('copies the current product URL and announces the result', async function () {
    var originalClipboard = navigator.clipboard;
    var writeText = vi.fn().mockResolvedValue();
    var context = { shareStatus: '' };

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeText }
    });

    await ProductDetailPage.methods.copyProductLink.call(context);

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(context.shareStatus).toBe('Product link copied to your clipboard.');
    expect(ProductDetailPage.template).toContain('Copy product link');

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard
    });
  });

  it('reports available product stock after accounting for the cart', function () {
    var product = Object.assign({}, products[0], { stock: 3 });

    expect(
      ProductDetailPage.computed.availableStock.call({
        product: product,
        cart: [Object.assign({}, product, { quantity: 2 })]
      })
    ).toBe(1);
    expect(ProductDetailPage.computed.stockLabel.call({ availableStock: 0 })).toBe(
      'Out of stock in this demo'
    );
  });

  it('limits the quantity picker to stock remaining after cart reservations', function () {
    expect(ProductDetailPage.computed.quantityOptions.call({ availableStock: 3 })).toEqual([
      1, 2, 3
    ]);
  });

  it('adds the selected quantity and resets the picker', function () {
    var emit = vi.fn();
    var context = {
      $emit: emit,
      product: products[0],
      selectedColor: 'Black',
      selectedQuantity: 3,
      selectedSize: 'M'
    };

    ProductDetailPage.methods.handleAddToCart.call(context);

    expect(emit).toHaveBeenCalledWith(
      'add-to-cart',
      expect.objectContaining({ quantity: 3, selectedColor: 'Black', selectedSize: 'M' })
    );
    expect(context.selectedQuantity).toBe(1);
  });

  it('records a viewed product after loading it', function () {
    var emit = vi.fn();
    var context = {
      $emit: emit,
      $route: { params: { id: '1' } },
      newReview: null,
      reviewStatus: 'old',
      reviews: [],
      selectedColor: '',
      selectedQuantity: 4,
      selectedSize: '',
      showCare: true,
      showShipping: true
    };

    ProductDetailPage.methods.loadProduct.call(context);

    expect(emit).toHaveBeenCalledWith('view-product', products[0]);
    expect(context.selectedQuantity).toBe(1);
  });

  it('requests an appropriate responsive size for the detail image', function () {
    expect(ProductDetailPage.template).toContain('sizes="(max-width: 768px) 100vw, 50vw"');
  });

  it('keeps product page section headings in order', function () {
    expect(ProductDetailPage.template).toContain('<h2>Description</h2>');
    expect(ProductDetailPage.template).not.toContain('<h3>Description</h3>');
  });

  it('suggests other styles from the current product category', function () {
    var product = products[0];
    var relatedStyles = ProductDetailPage.computed.relatedStyles.call({ product: product });

    expect(relatedStyles).toHaveLength(4);
    expect(relatedStyles).not.toContainEqual(product);
    expect(
      relatedStyles.slice(0, 2).every(function (item) {
        return item.category === product.category;
      })
    ).toBe(true);
    expect(ProductDetailPage.template).toContain('title="You may also like"');
  });
});
