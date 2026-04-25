export const VpAutoImports = {
  'el-admin-components': ['useForm', 'useMenu', 'useAudioPlayer', 'useDrag']
}

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
    resolve: (name) => {
      const directives = {
        Copy: { importName: 'VpDirectiveCopy' },
        Debounce: { importName: 'VpDirectiveDebounce' },
        Draggable: { importName: 'VpDirectiveDraggable' },
        Flash: { importName: 'VpDirectiveFlash' },
        LongPress: { importName: 'VpDirectiveLongPress' },
        ScrollText: { importName: 'VpDirectiveScrollText' },
        Throttle: { importName: 'VpDirectiveThrottle' },
        WaterMarker: { importName: 'VpDirectiveWaterMarker' }
      }
      if (!directives[name]) return
      return {
        name: directives[name].importName,
        from: 'el-admin-components'
      }
    }
  }
]
