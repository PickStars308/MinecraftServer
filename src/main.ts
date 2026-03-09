import {createApp} from 'vue'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import initRouter from './router'
import '@/assets/styles/style.css'
import '@/assets/styles/fonts.scss'
import '@/assets/styles/variables.scss'
import {install} from '@icon-park/vue-next/es/all';
import '@icon-park/vue-next/styles/index.css';


const app = createApp(App)
install(app);

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)


const router = await initRouter()
app.use(router)

app.mount('#app')
