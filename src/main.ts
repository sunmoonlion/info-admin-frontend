import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
// import I18n from './modules/i18n'
import ElementPlus from 'element-plus'

if (import.meta.env.MODE !== 'production' || import.meta.env.VITE_ELECTRON) {
  import('element-plus/dist/index.css')
  import('element-plus/theme-chalk/dark/css-vars.css')
}

// import 'reset-css'
// import '@unocss/reset/normalize.css'

// https://github.com/unocss/unocss/issues/2127
// import '@unocss/reset/tailwind.css'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

import 'virtual:svg-icons-register'
import { I18nModule } from 'el-admin-components'
import 'el-admin-components/style'

import './assets/main.scss'
// import { setupDirectives } from './directives'
import { setupStore } from './store'

const app = createApp(App)
app.use(ElementPlus)
app.use(I18nModule.i18nPlugin)
// app.use(ElAdminComponents)

// setupDirectives(app)
setupStore(app)

app.use(router)
// app.use(I18n)

app.mount('#app')

// app.config.errorHandler = (err, vm, info) => {
//   console.error('捕获到错误：', err, '组件实例：', vm, '信息：', info)
// }
