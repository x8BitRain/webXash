import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.mount('#app');
