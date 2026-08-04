export default {
  name: 'NotFoundPage',
  template: `
    <section class="container empty-cart" aria-labelledby="not-found-title">
      <h1 id="not-found-title" class="page-title">Page Not Found</h1>
      <p>The address you entered does not match a Style Ease page.</p>
      <p>Try one of these recovery options:</p>
      <div class="action-buttons">
        <router-link to="/" class="hero-cta">Go to Home</router-link>
        <router-link to="/products" class="back-button">Browse the Catalogue</router-link>
      </div>
    </section>
  `
};
