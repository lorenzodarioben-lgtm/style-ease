import { createApp } from 'vue';
import App from './js/app.js';
import router from './js/router.js';
import './style.css';

createApp(App).use(router).mount('#app');
