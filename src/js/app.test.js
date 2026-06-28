import { describe, expect, it, vi } from 'vitest';
import App from './app.js';
import { products } from './data/catalog.js';

function createAppContext(overrides) {
  return Object.assign(
    {
      cart: [],
      isCartBumping: false,
      searchInput: '',
      searchQuery: '',
      wishlist: [],
      $refs: {
        toast: {
          show: vi.fn()
        }
      },
      $route: {
        path: '/'
      },
      $router: {
        push: vi.fn()
      },
      bumpCartCount: vi.fn()
    },
    overrides
  );
}

describe('root app state methods', function () {
  it('adds duplicate cart items as separate cloned entries', function () {
    var context = createAppContext();

    App.methods.addToCart.call(context, products[0]);
    App.methods.addToCart.call(context, products[0]);

    expect(context.cart).toHaveLength(2);
    expect(context.cart[0]).toEqual(products[0]);
    expect(context.cart[0]).not.toBe(products[0]);
    expect(context.bumpCartCount).toHaveBeenCalledTimes(2);
    expect(context.$refs.toast.show).toHaveBeenCalledWith('Geometric T-Shirt added to your bag!');
  });

  it('ignores invalid cart removal indexes', function () {
    var context = createAppContext({ cart: [products[0], products[1]] });

    App.methods.removeFromCart.call(context, -1);
    App.methods.removeFromCart.call(context, 99);
    expect(context.cart).toHaveLength(2);

    App.methods.removeFromCart.call(context, 0);
    expect(context.cart).toEqual([products[1]]);
  });

  it('prevents duplicate wishlist entries and removes by product id', function () {
    var context = createAppContext();

    App.methods.addToWishlist.call(context, products[0]);
    App.methods.addToWishlist.call(context, products[0]);

    expect(context.wishlist).toHaveLength(1);
    expect(context.wishlist[0]).not.toBe(products[0]);

    App.methods.removeFromWishlist.call(context, products[0].id);
    expect(context.wishlist).toEqual([]);
  });

  it('trims search input and routes to the catalogue', function () {
    var context = createAppContext({
      searchInput: '  shirt  '
    });

    App.methods.performSearch.call(context);

    expect(context.searchQuery).toBe('shirt');
    expect(context.$router.push).toHaveBeenCalledWith('/products');
  });

  it('does not reroute searches that already start on the catalogue', function () {
    var context = createAppContext({
      searchInput: 'jeans',
      $route: {
        path: '/products'
      }
    });

    App.methods.performSearch.call(context);

    expect(context.searchQuery).toBe('jeans');
    expect(context.$router.push).not.toHaveBeenCalled();
  });
});
