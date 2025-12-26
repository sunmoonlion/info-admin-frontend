<template>
  <div class="w-screen h-screen overflow-hidden">
    <div class="position-fixed right-10 top-0">
      <el-row class="items-center">
        <VpDarkModeToggle class="mr-2"></VpDarkModeToggle>
        <VpChangeLocale :locales="locales" @change="handleLocalesChange" class="mr-2"></VpChangeLocale>
      </el-row>
    </div>
    <div v-if="settings.bg" :class="[
      'bg-center bg-cover w-full lg:w-1/3 xl:w-1/2 h-screen position-absolute top-0 z--1',
      settings.position === 'right' ? 'left-0' : 'right-0',
      settings.position === 'center' ? 'w-full!' : ''
    ]" :style="bgStyle" ref="bgRef"></div>
    <div class="flex flex-col items-center justify-center h-screen" :style="marginStyle">
      <div :class="['self-center bg-white dark:bg-dark rounded p-4', formClass]" ref="formRef">
        <!-- title -->
        <div class="text-2xl mb-10">{{ $t(settings.title) }}</div>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { I18nModule } from 'el-admin-components'

const loadLocaleMessages = I18nModule.loadLocaleMessages

const route = useRoute()

const settings = reactive({
  bg: '',
  title: '欢迎登录',
  position: '',
  imageWidth: 0
})
const bgRef = ref()
const formRef = ref()
const margin = ref()

useResizeObserver(bgRef, (entries) => {
  const { width } = entries[0].contentRect
  let changeWidth = 0
  if (formRef.value) {
    changeWidth = formRef.value.clientWidth
  }
  margin.value = (document.body.clientWidth - changeWidth - width) / 2
})

onBeforeMount(() => {
  settings.bg = route?.meta?.backgroundImage as string
  settings.title = route?.meta?.title as string
  settings.position = route?.meta?.position as string
})

const formClass = computed(() => {
  let cls = ''
  if (settings.position === 'center') {
    cls = ''
  }
  if (settings.position === 'left') {
    cls = 'lg:self-start'
  }
  if (settings.position === 'right') {
    cls = 'lg:self-end lt-xl2:shadow'
  }
  return cls
})

const marginStyle = computed(() => {
  if (margin.value < 0) {
    return { margin: '0 auto' }
  }
  if (settings.position === 'left') {
    return { marginLeft: margin.value + 'px' }
  }
  if (settings.position === 'right') {
    return { marginRight: margin.value + 'px' }
  }
})

const bgStyle = computed(() => {
  if (settings.imageWidth > 0) {
    return { width: settings.imageWidth + 'px', backgroundImage: `url(${settings.bg})` }
  }
  return { backgroundImage: `url(${settings.bg})` }
})

const locales = ref([
  {
    text: '中文',
    name: 'zh-CN',
    icon: 'uil:letter-chinese-a'
  },
  {
    text: 'English',
    name: 'en',
    icon: 'ri:english-input'
  }
])

const handleLocalesChange = (locales: string) => {
  loadLocaleMessages(locales)
}
</script>

<style scoped></style>
