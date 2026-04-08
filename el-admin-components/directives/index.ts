// vite glob -> modules

import type { App, Directive } from 'vue'

const modules = import.meta.glob('./modules/**/*.ts', {
  eager: true,
  import: 'default'
})

const directives = {
  install: (app: App) => {
    Object.keys(modules).forEach((key) => {
      const directiveName = key.replace('./modules/', '').replace('.ts', '')
      app.directive(directiveName, modules[key] as Directive)
    })
  }
}

export function setupDirectives(app: App) {
  app.use(directives)
}
