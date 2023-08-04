import { createApp } from 'vue'
import App from './App.vue'

// import 'element-plus/theme-chalk/dark/css-vars.css'
// import 'element-plus/dist/index.css'
import '@/styles/index.scss'

import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)
app.use(pinia)

app.mount('#app')
