import { createApp } from 'vue';
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import App from './js/app.js';
import router from './js/router.js';
import './style.css';

createApp(App).use(router).mount('#app');
