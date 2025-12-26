import type { Ref } from 'vue'

export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase()
  })
}

export function camelToHyphen(name: string) {
  return name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

// function forwardEventsUtils
// params: emits, array[string] string全是eventsName
// 响应回来的是一个对象
export function forwardEventsUtils(emits: any, arr: string[], prefix: string = '') {
  const forwardEvents: Record<string, (...args: any[]) => void> = {}

  arr.forEach((eventName) => {
    const name = kebabToCamel(eventName)
    forwardEvents[name] = (...args: any[]) => {
      emits(prefix + eventName, ...args)
    }
  })

  return forwardEvents
}

export function exposeEventsUtils(ref: Ref<any>, arr: string[]) {
  const exposeMethods: Record<string, Function> = {}

  arr.forEach((exposeName) => {
    // e.g.
    // tableRef.value.clearSelection()
    // obj = { clearSelection: () => tableRef.value.clearSelection()}
    exposeMethods[exposeName] = (...args: any[]) => {
      if (ref.value && typeof ref.value[exposeName] === 'function') {
        return ref.value[exposeName](...args)
      } else {
        return ref.value[exposeName]
      }
    }
  })

  return exposeMethods
}

/**
 * Formats the given number of seconds into a string representing the time in the format HH:MM:SS.
 *
 * @param {number} seconds - The number of seconds to format.
 * @return {string} The formatted time string in the format HH:MM:SS.
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.round(seconds % 60)

  let formattedTime = ''

  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, '0')
    formattedTime += `${formattedHours}:`
  }

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')

  formattedTime += `${formattedMinutes}:${formattedSeconds}`

  return formattedTime
}
