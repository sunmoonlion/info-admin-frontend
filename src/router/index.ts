import { createRouter, createWebHashHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

router.beforeEach(async (to) => {
  // 登录页不需要鉴权
  if (to.meta?.layout === 'single-page') return true

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      credentials: 'include',
    })
    const data = await res.json()
    if (!data?.user) return { path: '/login' }
  } catch {
    return { path: '/login' }
  }

  return true
})

export default router
