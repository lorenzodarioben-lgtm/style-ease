(function (StyleEase) {
  'use strict';

  StyleEase.createRouter = function () {
    return new VueRouter({
      routes: [
        { path: '/', component: StyleEase.pages.Home },
        { path: '/products', component: StyleEase.pages.Products },
        { path: '/product/:id', component: StyleEase.pages.ProductDetail },
        { path: '/cart', component: StyleEase.pages.Cart },
        { path: '/checkout', component: StyleEase.pages.Checkout },
        { path: '*', redirect: '/' }
      ]
    });
  };
}(window.StyleEase = window.StyleEase || {}));
