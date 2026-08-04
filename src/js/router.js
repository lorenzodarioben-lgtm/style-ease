import { reactive } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { findProductById, parseProductId } from './utils/catalog-utils.js';

const APP_TITLE = 'Style Ease';
export const LAZY_ROUTE_RELOAD_KEY = 'style-ease-lazy-route-reload';
export const routeRecoveryState = reactive({
  hasError: false,
  target: ''
});

function getSessionStorage(storage) {
  if (storage) {
    return storage;
  }

  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

export function clearLazyRouteReloadGuard(storage) {
  var browserStorage = getSessionStorage(storage);

  if (!browserStorage) {
    return;
  }

  try {
    browserStorage.removeItem(LAZY_ROUTE_RELOAD_KEY);
  } catch {
    // The retry UI remains available when session storage cannot be used.
  }
}

export function clearRouteRecovery() {
  routeRecoveryState.hasError = false;
  routeRecoveryState.target = '';
}

export function createLazyRouteErrorHandler(options) {
  var settings = options || {};
  var recoveryState = settings.recoveryState || routeRecoveryState;
  var browserStorage = getSessionStorage(settings.storage);
  var reload = settings.reload || function () {};

  return function (error, to) {
    var errorMessage = String((error && error.message) || error || '');
    var isLazyLoadFailure =
      /chunkloaderror|dynamically imported module|importing a module script|loading chunk/i.test(
        errorMessage
      );

    recoveryState.hasError = true;
    recoveryState.target = to && to.fullPath ? to.fullPath : '/';

    if (!isLazyLoadFailure || !browserStorage) {
      return;
    }

    try {
      if (browserStorage.getItem(LAZY_ROUTE_RELOAD_KEY)) {
        return;
      }

      browserStorage.setItem(LAZY_ROUTE_RELOAD_KEY, '1');
      reload();
    } catch {
      // A Retry action is still available if session storage is blocked.
    }
  };
}

export function retryFailedRoute(router) {
  var target = routeRecoveryState.target || '/';

  clearRouteRecovery();

  return router && typeof router.replace === 'function'
    ? router.replace(target)
    : Promise.resolve();
}

export function getRouteTitle(route) {
  if (route && route.name === 'not-found') {
    return 'Page Not Found - ' + APP_TITLE;
  }

  if (!route || route.path === '/') {
    return APP_TITLE + ' - Modern Fashion';
  }

  if (route.path === '/products') {
    return route.query && route.query.category
      ? route.query.category + ' - ' + APP_TITLE
      : 'Product Catalogue - ' + APP_TITLE;
  }

  if (route.path === '/cart') {
    return 'Shopping Cart - ' + APP_TITLE;
  }

  if (route.path === '/compare') {
    return 'Compare Styles - ' + APP_TITLE;
  }

  if (route.path === '/wishlist') {
    return 'Wishlist - ' + APP_TITLE;
  }

  if (route.path === '/orders') {
    return 'Demo Order History - ' + APP_TITLE;
  }

  if (route.path === '/checkout') {
    return 'Checkout - ' + APP_TITLE;
  }

  if (route.path.indexOf('/product/') === 0) {
    var product = findProductById(parseProductId(route.params.id));

    return (product ? product.name : 'Product Not Found') + ' - ' + APP_TITLE;
  }

  return APP_TITLE + ' - Modern Fashion';
}

function focusRouteStart() {
  var mainContent = document.getElementById('main-content');

  if (mainContent) {
    mainContent.focus({ preventScroll: true });
  }
}

export const routes = [
  {
    path: '/',
    component: function () {
      return import('./pages/home.js');
    }
  },
  {
    path: '/products',
    component: function () {
      return import('./pages/products.js');
    }
  },
  {
    path: '/product/:id',
    component: function () {
      return import('./pages/product-detail.js');
    }
  },
  {
    path: '/cart',
    component: function () {
      return import('./pages/cart.js');
    }
  },
  {
    path: '/compare',
    component: function () {
      return import('./pages/compare.js');
    }
  },
  {
    path: '/wishlist',
    component: function () {
      return import('./pages/wishlist.js');
    }
  },
  {
    path: '/orders',
    component: function () {
      return import('./pages/orders.js');
    }
  },
  {
    path: '/checkout',
    component: function () {
      return import('./pages/checkout.js');
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: function () {
      return import('./pages/not-found.js');
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
});

router.afterEach(function (to) {
  clearLazyRouteReloadGuard();
  clearRouteRecovery();
  document.title = getRouteTitle(to);
  window.setTimeout(focusRouteStart, 0);
});

router.onError(
  createLazyRouteErrorHandler({
    reload: function () {
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }
  })
);

export default router;
