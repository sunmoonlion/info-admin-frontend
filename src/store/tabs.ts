import type { VpAppRouteMenuItem } from 'el-admin-components'
import { defineStore } from 'pinia'

interface TabsStoreType {
  tabs: VpAppRouteMenuItem[]
  current: string
}

export const useTabsStore = defineStore('tabs', {
  state: () =>
    ({
      tabs: [] as VpAppRouteMenuItem[],
      current: ''
    }) as TabsStoreType,
  actions: {
    addRoute(route: VpAppRouteMenuItem) {
      if (this.tabs.some((item) => item.name === route.name || item.path === route.path)) return
      this.tabs.push({ ...route })
    },
    removeRoute(path: string) {
      this.tabs = this.tabs.filter((item) => item.name !== path)
    }
  },
  persist: true
})
