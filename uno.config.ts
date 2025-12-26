// uno.config.ts
import { defineConfig } from 'unocss'
// import presetWind from '@unocss/preset-wind'
import { presetWind, presetIcons } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  rules: [
    [
      'm-safe',
      {
        'margin-top': 'env(safe-area-inset-top)',
        'margin-right': 'env(safe-area-inset-right)',
        'margin-bottom': 'env(safe-area-inset-bottom)',
        'margin-left': 'env(safe-area-inset-left)'
      }
    ]
  ],
  presets: [
    presetWind(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block'
      }
    })
  ],
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xl2: '1444px',
      '2xl': '1536px'
    }
  },
  safelist: ['ep:full-screen', 'ri:fullscreen-exit-fill'],
  transformers: [transformerDirectives(), transformerVariantGroup()]
})
