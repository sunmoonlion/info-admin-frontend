declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 适配 unplugin-dts@1.x beta 的默认导出类型声明（CommonJS 风格）
declare module 'unplugin-dts/vite' {
  import type { Plugin } from 'vite'
  import type { PluginOptions } from 'unplugin-dts'
  const dts: (options?: PluginOptions) => Plugin | Plugin[]
  export default dts
}
