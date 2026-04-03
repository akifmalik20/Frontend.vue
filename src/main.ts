import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import router from './router' 
import './assets/css/main.css'
import { FontAwesomeIcon } from './plugins/fontawesome'

const app = createApp(App)
const pinia = createPinia()
app.component('font-awesome-icon', FontAwesomeIcon)
pinia.use(piniaPersist)
app.use(pinia) 

app.use(router)
app.mount('#app')