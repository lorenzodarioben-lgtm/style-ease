import { describe, expect, it } from 'vitest';
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

  it('updates selected size through the button handler', function () {
    var context = {
      selectedSize: 'S'
    };

    ProductDetailPage.methods.setSelectedSize.call(context, 'L');

    expect(context.selectedSize).toBe('L');
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
});
