import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import { globalPlugin as ElAdminComponents } from 'el-admin-components'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'
import './assets/main.scss'
import { setupStore } from './store'

const app = createApp(App)
app.use(ElementPlus)
app.use(ElAdminComponents)
setupStore(app)
app.use(router)
app.config.errorHandler = (err, _vm, info) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px;white-space:pre-wrap;font-size:13px">Vue Error [${info}]:\n${err instanceof Error ? err.stack : err}</pre>`
}

app.mount('#app')
