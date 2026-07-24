import { describe, expect, it, vi } from 'vitest';
import App from './app.js';
import { products } from './data/catalog.js';

function createStore() {
  return {
    addCartItem: vi.fn(function () {
      return true;
    }),
    addWishlistItem: vi.fn(),
    clearCart: vi.fn(),
    removeCartItem: vi.fn(),
    removeWishlistItem: vi.fn(),
    setSearchInput: vi.fn(),
    setSearchQuery: vi.fn(),
    state: {
      cart: [],
      searchInput: '',
      searchQuery: '',
      wishlist: []
    }
  };
}

function createAppContext(overrides) {
  return Object.assign(
    {
      isCartBumping: false,
      store: createStore(),
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
  it('adds cart items through the storefront store', function () {
    var context = createAppContext();

    App.methods.addToCart.call(context, products[0]);

    expect(context.store.addCartItem).toHaveBeenCalledWith(products[0]);
    expect(context.bumpCartCount).toHaveBeenCalledTimes(1);
    expect(context.$refs.toast.show).toHaveBeenCalledWith('Geometric T-Shirt added to your bag!');
  });

  it('delegates cart and wishlist changes to the storefront store', function () {
    var context = createAppContext();

    App.methods.removeFromCart.call(context, 0);
    App.methods.addToWishlist.call(context, products[0]);
    App.methods.removeFromWishlist.call(context, products[0].id);
    App.methods.clearCart.call(context);

    expect(context.store.removeCartItem).toHaveBeenCalledWith(0);
    expect(context.store.addWishlistItem).toHaveBeenCalledWith(products[0]);
    expect(context.store.removeWishlistItem).toHaveBeenCalledWith(products[0].id);
    expect(context.store.clearCart).toHaveBeenCalled();
  });

  it('submits the shared search query and routes to the catalogue', function () {
    var context = createAppContext();

    context.store.state.searchInput = '  shirt  ';
    App.methods.performSearch.call(context);

    expect(context.store.setSearchQuery).toHaveBeenCalledWith('  shirt  ');
    expect(context.$router.push).toHaveBeenCalledWith({ path: '/products', query: {} });
  });

  it('refreshes the catalogue URL when searching from the catalogue', function () {
    var context = createAppContext({
      $route: {
        path: '/products'
      }
    });

    context.store.state.searchInput = 'jeans';
    App.methods.performSearch.call(context);

    expect(context.store.setSearchQuery).toHaveBeenCalledWith('jeans');
    expect(context.$router.push).toHaveBeenCalledWith({ path: '/products', query: {} });
  });
});
