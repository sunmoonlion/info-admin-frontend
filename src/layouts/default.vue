<template>
  <div
    class="position-absolute left-0 top-0 w-full h-full overflow-hidden flex"
    :style="{ '--el-color-primary': settings?.theme }"
  >
    <!-- 左右布局 -->
    <!-- sidebar -->
    <div
      :style="{
        width: mixMenuWidth,
        backgroundColor: settings?.backgroundColor
      }"
      class="h-full transition-width shrink-0"
      v-if="settings?.mode !== 'top'"
    >
      <el-row class="h-full">
        <el-scrollbar
          v-if="settings?.mode !== 'mix'"
          :class="[settings?.mode !== 'mixbar' ? 'flex-1' : 'w-[64px] py-4']"
          :style="{
            backgroundColor:
              settings?.mode !== 'mixbar' ? 'auto' : darken(settings?.backgroundColor, 0.2)
          }"
        >
          <!-- menu: 左侧 左侧菜单混合 -->
          <VpMenu
            v-if="settings?.mode === 'siderbar' || settings?.mode === 'mixbar'"
            text-color="#b8b8b8"
            :class="[{ mixbar: settings?.mode === 'mixbar' }]"
            :data="mixMenus"
            :collapse="settings?.mode !== 'mixbar' && localSettings.collapse"
            :background-color="
              settings?.mode !== 'mixbar' ? settings?.backgroundColor : 'transparent'
            "
            :active-text-color="settings?.theme"
            @select="handleSelect"
          ></VpMenu>
        </el-scrollbar>
        <!-- menu二级菜单：左侧菜单混合，顶部左侧菜单混合-->
        <el-scrollbar v-if="settings?.mode === 'mixbar' || settings?.mode === 'mix'" class="flex-1">
          <!-- menu -->
          <VpMenu
            text-color="#b8b8b8"
            :data="getSubMenus(menus)"
            :collapse="localSettings.collapse"
            :background-color="settings?.backgroundColor"
            :active-text-color="settings?.theme"
            @select="handleSelect"
          >
          </VpMenu>
        </el-scrollbar>
      </el-row>
    </div>
    <!-- content -->
    <div :class="['relative w-full h-full flex-1 overflow-hidden']">
      <div class="overflow-y-auto h-full">
        <!-- header: fullscreen, darkmode, theme, menu -->
        <VpHeader
          v-model:collapse="localSettings.collapse"
          :username="username"
          :src="avatar"
          :data="avatarMenu"
          :settings="settings"
          :locales="[]"
          :show-collapse="!lockCollapse"
          @settings-change="handleSettigsChange"
          @select="handleSelect"
        >
          <!-- menu：顶部左侧菜单混合 -->
          <VpMenu
            v-if="settings?.mode === 'mix' || settings?.mode === 'top'"
            mode="horizontal"
            :data="settings?.mode === 'mix' ? getTopMenus(menus) : menus"
            :collapse="false"
            :active-text-color="settings?.theme"
            @select="handleSelect"
          ></VpMenu>
        </VpHeader>
        <VpHeaderTabs
          v-if="settings?.showTabs"
          :data="tabsStore.tabs"
          @tab-click="handleTabClick"
          @tab-remove="handleTabRemove"
          @tab-menu-click="handleTabMenuClick"
          v-model="tabsStore.current"
        ></VpHeaderTabs>
        <!-- router-view -->
        <div :class="['p-2 bg', contentClass]">
          <el-scrollbar>
            <Transition
              :name="camelToHyphen(settings?.transition || 'fade') + '-transition'"
              mode="out-in"
            >
              <router-view v-slot="{ Component }" v-if="$route.meta.keepAlive">
                <keep-alive :key="settings?.transition">
                  <component
                    :is="Component"
                    :key="$route.fullPath"
                    class="rounded bg-[var(--el-bg-color)] shadow p-4"
                  >
                  </component>
                </keep-alive>
              </router-view>
              <router-view v-slot="{ Component }" v-else>
                <component
                  :is="Component"
                  :key="$route.fullPath"
                  class="rounded bg-[var(--el-bg-color)] shadow p-4"
                >
                </component>
              </router-view>
            </Transition>
          </el-scrollbar>

          <!-- <transition mode="out-in" name="fade">
      <KeepAlive :include="['Index', 'Home', 'About', '/', '/about/']" :max="20">
        <component :is="Component" :key="route.fullPath" class="p-4 rounded shadow bg-white" />
      </KeepAlive>
    </transition> -->
        </div>
      </div>
      <!-- <el-scrollbar>
      </el-scrollbar> -->
      <!-- <div class="overflow-y-auto h-full">
        <router-view></router-view>
      </div> -->
    </div>
    <!-- drawer -->
    <el-drawer
      direction="ltr"
      class="w-full!"
      :style="{ backgroundColor: settings?.backgroundColor }"
      v-if="isMobile"
      :model-value="!localSettings.collapse"
      @close="localSettings.collapse = true"
    >
      <!-- menu: 左侧 左侧菜单混合 -->
      <VpMenu
        text-color="#b8b8b8"
        :data="menus"
        :background-color="settings?.backgroundColor"
        :active-text-color="settings?.theme"
        @select="handleSelect"
      ></VpMenu>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router/auto'
import type {
  VpHeaderProps,
  VpThemeSettingsProps,
  VpDropDownMenuItem,
  VpAppRouteMenuItem
} from 'el-admin-components'
import { routes } from 'vue-router/auto-routes'
// import { useMenu } from 'el-admin-components'
import { darken, camelToHyphen } from '@/utils'
import { ElScrollbar } from 'element-plus'
import { useTabsStore } from '../store/tabs'
// import { TabActions } from '@/components/Layouts/const'

enum TabActions {
  closeOthers = 'closeOthers',
  closeLeft = 'closeLeft',
  closeRight = 'closeRight',
  closeAll = 'closeAll'
}

interface ThemeSettingsOption {
  collapse: boolean
  username: string
  avatar: string
  avatarMenu: VpDropDownMenuItem[]
  settings: VpThemeSettingsProps
}

const isMobile = ref(false)
const lockCollapse = ref(false)

const route = useRoute()
const router = useRouter()

const tabsStore = useTabsStore()

const localSettings = reactive<ThemeSettingsOption>({
  // 折叠菜单
  collapse: false,
  username: 'admin',
  avatar: '',
  // TODO
  avatarMenu: [],
  settings: {
    theme: '#409eff',
    backgroundColor: '#001529',
    darkMode: false,
    menuWidth: 280,
    showLogo: false,
    showTabs: true,
    fixedHead: false,
    showBreadcrumb: true,
    mode: 'siderbar',
    transition: 'Fade'
  } as VpThemeSettingsProps
})

const { username, avatar, avatarMenu } = toRefs(localSettings)

function generateMenuData(routes: RouteRecordRaw[]): VpAppRouteMenuItem[] {
  const menuData: VpAppRouteMenuItem[] = []

  routes.forEach((route) => {
    const isLayoutRoute = Boolean((route.meta as any)?.isLayout)

    // 如果是布局占位路由（由 vite-plugin-vue-layouts 注入），
    // 直接提升其子路由，避免在菜单中产生多级占位节点
    if (isLayoutRoute && Array.isArray(route.children) && route.children.length > 0) {
      const children = generateMenuData(route.children)
      children.forEach((child) => menuData.push(child))
      return
    }

    const menuItem: VpAppRouteMenuItem = {
      path: route.path,
      name: route.name,
      meta: route.meta,
      alias: typeof route.redirect === 'string' ? route.redirect : undefined,
      component: route.component as any
    }

    if (Array.isArray(route.children) && route.children.length > 0) {
      menuItem.children = generateMenuData(route.children)
    }

    menuData.push(menuItem)
  })

  return menuData
}

const { getTopMenus, getSubMenus } = useMenu()

const menus = computed(() => generateMenuData(routes))
const settings = computed(() => localSettings.settings)
// 混合菜单
const mixMenus = computed(() =>
  settings.value?.mode === 'mixbar' ? getTopMenus(menus.value) : menus.value
)
const menuWidth = computed(() => (localSettings.settings ? localSettings.settings.menuWidth : 240))

// 判断二组菜单的顶级是否所有的菜单项都设置了icon
const isFullIcons = computed(() =>
  getSubMenus(menus.value).every(
    (item) => typeof item.meta?.icon !== 'undefined' && item.meta?.icon
  )
)

// 混合左侧双菜单模式下的菜单宽度
const mixMenuWidth = computed(() => {
  if (isMobile.value) {
    return 0
  }
  if (settings.value?.mode === 'mixbar') {
    if (!getSubMenus(menus.value).length) {
      lockCollapse.value = true
      return '64px'
    } else {
      lockCollapse.value = false
    }
    if (isFullIcons.value) {
      return localSettings.collapse ? 'auto' : menuWidth.value + 'px'
    }
  }
  if (settings.value?.mode === 'mix') {
    if (!getSubMenus(menus.value).length) {
      lockCollapse.value = true
      return 0
    } else {
      lockCollapse.value = false
    }
  }

  return localSettings.collapse ? '64px' : menuWidth.value + 'px'
})

const tmpWidth = ref(0)
const changeWidthFlag = ref(false)
useResizeObserver(document.body, (entries) => {
  document.documentElement.style.setProperty('--body-height', `${window.innerHeight}px`)

  const { width } = entries[0].contentRect
  if (tmpWidth.value === 0) {
    tmpWidth.value = width
  }
  if (width > tmpWidth.value) {
    // 扩大屏幕
    changeWidthFlag.value = width < 640
  } else {
    // 缩小屏幕
    changeWidthFlag.value = width > 1200
  }
  if (width < 640 && !changeWidthFlag.value) {
    localSettings.collapse = true
  }
  if (width > 1200 && !changeWidthFlag.value) {
    localSettings.collapse = false
  }
  isMobile.value = width < 440
  tmpWidth.value = width
})

// 内容区域class
const contentClass = computed(() => {
  if (settings.value?.fixedHead) {
    if (settings.value?.showTabs) {
      return 'h-[calc(100%-90px)]'
    } else {
      return 'h-[calc(100%-50px)]'
    }
  } else {
    if (settings.value?.showTabs) {
      return 'min-h-[calc(100%-90px)]'
    } else {
      return 'min-h-[calc(100%-50px)]'
    }
  }
})

onBeforeMount(() => {
  // user-agent是否是移动端
  if (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
  ) {
    isMobile.value = true
    localSettings.collapse = true
  }
})

watch(
  route,
  () => {
    tabsStore.addRoute(route)
    tabsStore.current = route.name as string
  },
  {
    immediate: true
  }
)

const handleSettigsChange = (themeSettings: VpThemeSettingsProps) => {
  localSettings.settings = themeSettings
}

const handleSelect = (item: VpAppRouteMenuItem) => {
  if (item && item.name) {
    router.push(item.name as string)
    if (isMobile.value) localSettings.collapse = true
  }
}

const handleTabClick = (tab: any) => {
  const { index } = tab
  const route = tabsStore.tabs[index]
  router.push(route.name as string)
}

const handleTabRemove = (tab: any) => {
  tabsStore.removeRoute(tab)
  if (tabsStore.current === tab) {
    if (tabsStore.tabs.length !== 0) {
      tabsStore.current = tabsStore.tabs[0].name as string
    } else {
      // 用户删除了最后一个tab
      const tmpRoute = menus.value.filter((item) => item.path === '/')[0]
      tabsStore.addRoute(tmpRoute)
      tabsStore.current = tmpRoute.name as string
    }
    router.push(tabsStore.current)
  }
}

const handleTabMenuClick = (action: TabActions) => {
  const index = tabsStore.tabs.findIndex((item) => item.name === tabsStore.current)
  if (action === TabActions.closeAll) {
    tabsStore.tabs = []
    const tmpRoute = menus.value.filter((item) => item.path === '/')[0]
    tabsStore.addRoute(tmpRoute)
    tabsStore.current = tmpRoute.name as string
  } else if (action === TabActions.closeLeft) {
    tabsStore.tabs = tabsStore.tabs.splice(index, tabsStore.tabs.length - 1)
  } else if (action === TabActions.closeRight) {
    tabsStore.tabs = tabsStore.tabs.splice(0, index + 1)
  } else if (action === TabActions.closeOthers) {
    tabsStore.tabs = tabsStore.tabs.splice(index, 1)
  }
  router.push(tabsStore.current)
}
</script>

<style lang="scss" scoped>
.bg {
  background-color: var(--el-fill-color-light);
}

.mixbar {
  :deep(.el-menu-item) {
    height: auto;
    line-height: unset !important;
    flex-direction: column;
    margin-bottom: 15px;
    padding: 4px 0 !important;

    svg {
      margin-right: 0;
      margin-bottom: 10px;
    }
  }
}

:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
