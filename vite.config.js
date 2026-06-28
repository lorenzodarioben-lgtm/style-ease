import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// The production build is served from the GitHub Pages project subpath
// (https://lorenzodarioben-lgtm.github.io/style-ease/), while local development
// runs at the root. Keying the base on the production mode keeps a single source
// of truth for the deployment path and makes `vite preview` serve the built app
// under the same subpath used in production.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/style-ease/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  test: {
    environment: 'happy-dom'
  }
}));
