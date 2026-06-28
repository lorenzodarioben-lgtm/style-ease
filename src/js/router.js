import { createRouter, createWebHashHistory } from 'vue-router';
import CartPage from './pages/cart.js';
import CheckoutPage from './pages/checkout.js';
import HomePage from './pages/home.js';
import ProductDetailPage from './pages/product-detail.js';
import ProductsPage from './pages/products.js';
import { findProductById } from './utils/catalog-utils.js';

const APP_TITLE = 'Style Ease';

export function getRouteTitle(route) {
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

  if (route.path === '/checkout') {
    return 'Checkout - ' + APP_TITLE;
  }

  if (route.path.indexOf('/product/') === 0) {
    var product = findProductById(Number.parseInt(route.params.id, 10));

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

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/products', component: ProductsPage },
    { path: '/product/:id', component: ProductDetailPage },
    { path: '/cart', component: CartPage },
    { path: '/checkout', component: CheckoutPage },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

router.afterEach(function (to) {
  document.title = getRouteTitle(to);
  window.setTimeout(focusRouteStart, 0);
});

export default router;
