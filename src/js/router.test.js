import { describe, expect, it, vi } from 'vitest';
import {
  clearLazyRouteReloadGuard,
  createLazyRouteErrorHandler,
  getRouteTitle,
  LAZY_ROUTE_RELOAD_KEY,
  retryFailedRoute,
  routeRecoveryState,
  routes
} from './router.js';

function createSessionStorage() {
  var values = {};

  return {
    getItem: function (key) {
      return values[key] || null;
    },
    removeItem: function (key) {
      delete values[key];
    },
    setItem: function (key, value) {
      values[key] = String(value);
    }
  };
}

describe('route titles', function () {
  it('returns meaningful titles for primary routes', function () {
    expect(getRouteTitle({ path: '/' })).toBe('Style Ease - Modern Fashion');
    expect(getRouteTitle({ path: '/products', query: {} })).toBe('Product Catalogue - Style Ease');
    expect(getRouteTitle({ path: '/cart' })).toBe('Shopping Cart - Style Ease');
    expect(getRouteTitle({ path: '/compare' })).toBe('Compare Styles - Style Ease');
    expect(getRouteTitle({ path: '/wishlist' })).toBe('Wishlist - Style Ease');
    expect(getRouteTitle({ path: '/orders' })).toBe('Demo Order History - Style Ease');
    expect(getRouteTitle({ path: '/checkout' })).toBe('Checkout - Style Ease');
    expect(getRouteTitle({ name: 'not-found', path: '/missing' })).toBe(
      'Page Not Found - Style Ease'
    );
  });

  it('includes category and product context when available', function () {
    expect(getRouteTitle({ path: '/products', query: { q: '  shirt ' } })).toBe(
      'Search: shirt - Style Ease'
    );
    expect(getRouteTitle({ path: '/products', query: { category: 'Jackets' } })).toBe(
      'Jackets - Style Ease'
    );
    expect(getRouteTitle({ path: '/product/1', params: { id: '1' } })).toBe(
      'Geometric T-Shirt - Style Ease'
    );
    expect(getRouteTitle({ path: '/product/9999', params: { id: '9999' } })).toBe(
      'Product Not Found - Style Ease'
    );
    expect(getRouteTitle({ path: '/product/1abc', params: { id: '1abc' } })).toBe(
      'Product Not Found - Style Ease'
    );
  });

  it('defers every route page to a route-level module', function () {
    var pageRoutes = routes.filter(function (route) {
      return route.component;
    });

    expect(pageRoutes).toHaveLength(9);
    expect(
      pageRoutes.every(function (route) {
        return typeof route.component === 'function';
      })
    ).toBe(true);
    expect(
      routes.find(function (route) {
        return route.name === 'not-found';
      })
    ).toMatchObject({ path: '/:pathMatch(.*)*' });
  });

  it('guards a lazy-route refresh to one reload per session and retains a retry target', function () {
    var storage = createSessionStorage();
    var recoveryState = { hasError: false, target: '' };
    var reloads = 0;
    var handleError = createLazyRouteErrorHandler({
      recoveryState: recoveryState,
      reload: function () {
        reloads += 1;
      },
      storage: storage
    });
    var error = new Error('Failed to fetch dynamically imported module');
    var route = { fullPath: '/products' };

    handleError(error, route);
    handleError(error, route);

    expect(reloads).toBe(1);
    expect(storage.getItem(LAZY_ROUTE_RELOAD_KEY)).toBe('1');
    expect(recoveryState).toEqual({ hasError: true, target: '/products' });

    clearLazyRouteReloadGuard(storage);
    expect(storage.getItem(LAZY_ROUTE_RELOAD_KEY)).toBeNull();
  });

  it('retries the failed route through Vue Router and clears the recovery UI state', async function () {
    var replace = vi.fn(function () {
      return Promise.resolve();
    });
    var router = { replace: replace };

    routeRecoveryState.hasError = true;
    routeRecoveryState.target = '/wishlist';
    await retryFailedRoute(router);

    expect(replace).toHaveBeenCalledWith('/wishlist');
    expect(routeRecoveryState).toMatchObject({ hasError: false, target: '' });
  });
});
