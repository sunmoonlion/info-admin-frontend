export const VpAutoImports = {
  'el-admin-components': ['useForm', 'useMenu', 'useAudioPlayer', 'useDrag']
}

import type { ComponentResolver } from 'unplugin-vue-components/types'

export const VpComponentsResolver = [
  {
    type: 'component',
    resolve: (componentName) => {
      if (componentName.startsWith('Vp'))
        return { name: componentName, from: 'el-admin-components' }
    }
  },
  {
    type: 'directive',
    resolve: (name: string) => {
      const directives = {
        Copy: { importName: 'VpDirectiveCopy' },
        Debounce: { importName: 'VpDirectiveDebounce' },
        Draggable: { importName: 'VpDirectiveDraggable' },
        Flash: { importName: 'VpDirectiveFlash' },
        LongPress: { importName: 'VpDirectiveLongPress' },
        ScrollText: { importName: 'VpDirectiveScrollText' },
        Throttle: { importName: 'VpDirectiveThrottle' },
        WaterMarker: { importName: 'VpDirectiveWaterMarker' }
      } as Record<string, any>
      if (!directives[name]) return
      return {
        name: directives[name].importName,
        from: 'el-admin-components'
      }
    }
  }
] as ComponentResolver[]
