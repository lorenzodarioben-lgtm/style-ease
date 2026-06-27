(function (StyleEase) {
  'use strict';

  StyleEase.pages = StyleEase.pages || {};

  StyleEase.pages.Home = {
    data: function () {
      return {
        brands: StyleEase.data.featuredBrands,
        categories: StyleEase.data.categoryLinks
      };
    },
    template: `
      <div>
        <section class="hero container">
          <div class="hero-content">
            <h1 class="hero-title">Angular Fashion</h1>
            <p class="hero-description">
              Precision-crafted style that cuts through the ordinary.
              Embrace geometric elegance and bold architectural design.
            </p>
            <router-link to="/products" class="hero-cta">Explore Collection</router-link>
          </div>
          <div class="hero-image">
            <img src="https://images.unsplash.com/photo-1615222443417-6d76586644a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDMwOTEyNDh8&ixlib=rb-4.0.3&q=85" alt="Fashion Model">
          </div>
        </section>

        <section class="categories container">
          <h2 class="section-title">Shop by Category</h2>
          <div class="categories-grid">
            <router-link
              class="category-item"
              v-for="category in categories"
              :key="category.name"
              :to="{ path: '/products', query: { category: category.name } }"
            >
              <img :src="category.image" :alt="category.name">
              <h3>{{ category.name }}</h3>
            </router-link>
          </div>
        </section>

        <section class="brands container">
          <h2 class="section-title">Featured Brands</h2>
          <div class="brands-grid">
            <div class="brand-item" v-for="brand in brands" :key="brand">{{ brand }}</div>
          </div>
        </section>
      </div>
    `
  };
}(window.StyleEase = window.StyleEase || {}));
