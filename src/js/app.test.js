import { describe, expect, it, vi } from 'vitest';
import App from './app.js';
import { products } from './data/catalog.js';

function createStore() {
  return {
    addCartItem: vi.fn(function () {
      return true;
    }),
    addWishlistItem: vi.fn(function () {
      return true;
    }),
    clearCart: vi.fn(),
    reset: vi.fn(),
    removeCartItem: vi.fn(function () {
      return true;
    }),
    removeWishlistItem: vi.fn(),
    setSearchInput: vi.fn(function (value) {
      this.state.searchInput = typeof value === 'string' ? value : '';
    }),
    setSearchQuery: vi.fn(function (value) {
      this.state.searchQuery = typeof value === 'string' ? value.trim() : '';
    }),
    state: {
      cart: [],
      comparison: [],
      orders: [],
      recentlyViewed: [],
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
        path: '/',
        query: {}
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

  it('moves a wishlist item only after the cart accepts it', function () {
    var context = createAppContext();

    expect(App.methods.moveWishlistItemToCart.call(context, products[0])).toBe(true);

    expect(context.store.addCartItem).toHaveBeenCalledWith(products[0]);
    expect(context.store.removeWishlistItem).toHaveBeenCalledWith(products[0]);
    expect(context.bumpCartCount).toHaveBeenCalledTimes(1);
    expect(context.$refs.toast.show).toHaveBeenCalledWith('Geometric T-Shirt moved to your bag.');
  });

  it('saves a cart variant before removing it from the bag', function () {
    var selectedItem = Object.assign({}, products[1], {
      selectedColor: 'Black',
      selectedSize: 'M'
    });
    var context = createAppContext();

    context.store.state.cart = [selectedItem];

    expect(App.methods.saveCartItemForLater.call(context, 0)).toBe(true);
    expect(context.store.addWishlistItem).toHaveBeenCalledWith(selectedItem);
    expect(context.store.removeCartItem).toHaveBeenCalledWith(0);
    expect(context.$refs.toast.show).toHaveBeenCalledWith('Angular Jacket saved for later.');
  });

  it('keeps a cart item when it cannot be saved for later', function () {
    var context = createAppContext();

    context.store.state.cart = [products[0]];
    context.store.addWishlistItem.mockReturnValue(false);

    expect(App.methods.saveCartItemForLater.call(context, 0)).toBe(false);
    expect(context.store.removeCartItem).not.toHaveBeenCalled();
    expect(context.$refs.toast.show).toHaveBeenCalledWith(
      'We could not save Geometric T-Shirt for later. Your bag is unchanged.'
    );
  });

  it('removes a cart variant when that exact variant is already saved', function () {
    var selectedItem = Object.assign({}, products[1], {
      selectedColor: 'Black',
      selectedSize: 'M'
    });
    var context = createAppContext();

    context.store.state.cart = [selectedItem];
    context.store.state.wishlist = [selectedItem];
    context.store.addWishlistItem.mockReturnValue(false);

    expect(App.methods.saveCartItemForLater.call(context, 0)).toBe(true);
    expect(context.store.addWishlistItem).not.toHaveBeenCalled();
    expect(context.store.removeCartItem).toHaveBeenCalledWith(0);
  });

  it('keeps a wishlist item when there is no stock to move it into the cart', function () {
    var context = createAppContext();

    context.store.addCartItem.mockReturnValue(false);

    expect(App.methods.moveWishlistItemToCart.call(context, products[0])).toBe(false);

    expect(context.store.removeWishlistItem).not.toHaveBeenCalled();
    expect(context.bumpCartCount).not.toHaveBeenCalled();
    expect(context.$refs.toast.show).toHaveBeenCalledWith(
      'Geometric T-Shirt is no longer available in the selected quantity.'
    );
  });

  it('clears saved demo data through the central storefront store', function () {
    var context = createAppContext();

    App.methods.clearDemoData.call(context);

    expect(context.store.reset).toHaveBeenCalledOnce();
    expect(context.$refs.toast.show).toHaveBeenCalledWith('Saved demo data has been cleared.');
  });

  it('submits the shared search query and routes to the catalogue', function () {
    var context = createAppContext();

    context.store.state.searchInput = '  shirt  ';
    App.methods.performSearch.call(context);

    expect(context.store.setSearchQuery).toHaveBeenCalledWith('  shirt  ');
    expect(context.$router.push).toHaveBeenCalledWith({ path: '/products', query: { q: 'shirt' } });
  });

  it('refreshes the catalogue URL when searching from the catalogue', function () {
    var context = createAppContext({
      $route: {
        path: '/products',
        query: { category: 'Tops' }
      }
    });

    context.store.state.searchInput = 'jeans';
    App.methods.performSearch.call(context);

    expect(context.store.setSearchQuery).toHaveBeenCalledWith('jeans');
    expect(context.$router.push).toHaveBeenCalledWith({
      path: '/products',
      query: { category: 'Tops', q: 'jeans' }
    });
  });

  it('preserves active filters and sorting while searching the catalogue', function () {
    var context = createAppContext({
      $route: {
        path: '/products',
        query: {
          category: 'Tops,Jackets',
          color: 'Black',
          page: '3',
          price: 'Over $100',
          size: 'M,L',
          sort: 'price-desc'
        }
      }
    });

    context.store.state.searchInput = 'jacket';
    App.methods.performSearch.call(context);

    expect(context.$router.push).toHaveBeenCalledWith({
      path: '/products',
      query: {
        category: 'Tops,Jackets',
        color: 'Black',
        price: 'Over $100',
        q: 'jacket',
        size: 'M,L',
        sort: 'price-desc'
      }
    });
  });

  it('synchronizes the shared search state from a direct catalogue URL', function () {
    var context = createAppContext();

    App.methods.syncSearchQueryFromRoute.call(context, '  angular  ');

    expect(context.store.state.searchInput).toBe('  angular  ');
    expect(context.store.state.searchQuery).toBe('angular');
  });
});
