<template>
  <v-chart v-bind="props" :style="computedStyle" />
</template>

<script setup lang="ts">
import type { VueEchartsProps } from './types'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import * as Charts from 'echarts/charts'
import * as ChartsComponents from 'echarts/components'
import * as ChartsFeatures from 'echarts/features'
import VChart from 'vue-echarts'
import { COMPONENTS_MAP, CHARTS_MAP } from './const'

const props = withDefaults(defineProps<VueEchartsProps>(), {
  autoresize: true,
  theme: 'default',
  height: '400px'
  // charts: 'PieChart',
  // components: () => [
  //   'TitleComponent',
  //   'TooltipComponent',
  //   'LegendComponent',
  //   'AriaComponent',
  //   'GridComponent'
  // ]
})

const computedStyle = computed(() => {
  let result = {} as Record<string, any>
  const { theme, style, height } = props
  if (theme && theme.startsWith('#')) {
    result = { backgroundColor: theme }
  }
  result.height = typeof height === 'number' ? `${height}px` : height
  return { ...style, ...result }
})

if (import.meta.env.MODE !== 'production') {
  onBeforeMount(() => {
    let deps: string[] = []
    if (props.option) {
      Object.keys(props.option).forEach((key) => {
        const compName = (COMPONENTS_MAP as Record<string, string>)[key]
        if (compName) {
          deps.push(compName)
        }
      })
    }

    if (props.components) {
      deps = props.components
    }

    let type = 'pie'
    const features: string[] = []
    const series = Array.isArray(props.option.series) ? props.option.series[0] : props.option.series

    if (series) {
      type = series.type || 'pie'

      if (series.labelLayout) {
        features.push('LabelLayout')
      }
      if (series.universalTransition) {
        features.push('UniversalTransition')
      }
    }

    const chartsMap = CHARTS_MAP as Record<string, string>
    const chartsNs = Charts as Record<string, any>
    const componentsNs = ChartsComponents as Record<string, any>
    const featuresNs = ChartsFeatures as Record<string, any>
    use([
      CanvasRenderer,
      chartsNs[chartsMap[type]],
      ...deps.map((o) => componentsNs[o]),
      ...features.map((o) => featuresNs[o])
    ])
  })
}
</script>

<style scoped></style>
