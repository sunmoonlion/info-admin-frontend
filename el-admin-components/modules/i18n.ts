// import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
// 'zh-cn': () => import('element-plus/dist/locale/zh-cn.mjs'),
// en: () => import('element-plus/dist/locale/en.mjs')
import zhCN from 'element-plus/dist/locale/zh-cn.min.mjs'
import en from 'element-plus/dist/locale/en.min.mjs'
// import localzhCN from '../../locales/zh-cn.json'
// import localen from '../../locales/en.json'
// import localzhCN from 'el-admin-components/locales/zh-cn.json'
// import localen from 'el-admin-components/locales/en.json'
import { defu } from 'defu'

export const i18n = createI18n({
  legacy: false,
  locale: '',
  messages: {}
})

// @ts-ignore
export const $t: typeof i18n.global.t = i18n.global.t

const loadedLanguages: string[] = []
let localesMap = {
  // 'zh-cn': localzhCN,
  // en: localen
} as Record<string, any>
let elementPlusLocalesMap = {} as Record<string, any>

export const localesMapLoader = (newLocalesMap = {}) => {
  const base = import.meta.env.BASE_URL

  const originLocale = {
    'zh-cn': () => fetch(`${base}locales/zh-cn.json`).then((res) => res.json()),
    en: () => fetch(`${base}locales/en.json`).then((res) => res.json()),
    ...localesMap
  }

  localesMap = defu(newLocalesMap, originLocale)
}

export const epLocaleLoader = (newEPLocalesMap: any = {}) => {
  const origin = {
    'zh-cn': zhCN,
    en,
    ...elementPlusLocalesMap
  }
  elementPlusLocalesMap = { ...origin, ...newEPLocalesMap }
}

export const availableLocales = Object.keys(localesMap)

export function setI18nLanguage(locale: string) {
  i18n.global.locale.value = locale
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', locale)
  }
}

export async function loadLocaleMessages(l: string) {
  const lang = l.toLowerCase()
  // 如果已经被i18n插件进行加载的，则直接设置i18n.locale
  if (i18n.global.locale.value === lang || loadedLanguages.includes(lang)) {
    return setI18nLanguage(lang)
  }
  if (localesMap && localesMap[lang]) {
    const messages =
      typeof localesMap[lang] === 'function' ? await localesMap[lang]() : localesMap[lang]
    const messagesEP = await elementPlusLocalesMap[lang]
    // set locale and locale message
    i18n.global.setLocaleMessage(lang, {
      ...messagesEP,
      ...messages
    })
    loadedLanguages.push(lang)
    return setI18nLanguage(lang)
  } else {
    setTimeout(() => {
      initLocales()
    }, 1000)
  }
}

async function initLocales() {
  localesMapLoader()
  epLocaleLoader()
  await loadLocaleMessages('zh-CN')
}

// app.use(I18nModule.i18nPlugin)
export const i18nPlugin = {
  install(app: any) {
    app.use(i18n)
    initLocales()
  }
}
