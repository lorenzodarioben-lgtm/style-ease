import { createRouter, createWebHashHistory } from 'vue-router';
import CartPage from './pages/cart.js';
import CheckoutPage from './pages/checkout.js';
import HomePage from './pages/home.js';
import ProductDetailPage from './pages/product-detail.js';
import ProductsPage from './pages/products.js';

export default createRouter({
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
