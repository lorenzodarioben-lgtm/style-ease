import { createRouter, createWebHashHistory } from 'vue-router';
import { findProductById, parseProductId } from './utils/catalog-utils.js';

const APP_TITLE = 'Style Ease';

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
  document.title = getRouteTitle(to);
  window.setTimeout(focusRouteStart, 0);
});

export default router;
