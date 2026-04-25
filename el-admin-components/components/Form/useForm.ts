import type { FormSchema } from './types'

export function useForm(schema: FormSchema) {
  const model = ref<any>()
  const rules = ref<any>()

  onBeforeMount(() => {
    model.value = setForm(schema || [])
    rules.value = setRules(schema || [])
  })
  function setForm(arr: any[]) {
    const obj: Record<string, any> = {}
    arr.forEach((item) => {
      if (item.value) {
        obj[item.prop] = item.value
      } else if (item.schema && item.schema.length) {
        item.schema.forEach((child: any) => {
          if (child.prop) {
            obj[child.prop] = child.value
          }
        })
      } else if (item.prop) {
        obj[item.prop] = undefined
      }
    })
    return obj
  }

  function setRules(arr: any[]) {
    let formRules: Record<string, any> = {}
    arr.forEach((item) => {
      if (item.prop && item.rules) {
        formRules[item.prop] = item.rules
      }
      if (item.schema && item.schema.length) {
        formRules = { ...formRules, ...setRules(item.schema) }
      }
    })
    return formRules
  }

  function flatObj(obj: Record<string, any>) {
    let result: Record<string, any> = {}
    if (typeof obj !== 'object') return result
    for (const key in obj) {
      if (
        typeof obj[key] === 'object' &&
        !Array.isArray(obj[key]) &&
        Object.keys(obj[key]).length
      ) {
        result = { ...result, ...flatObj(obj[key]) }
      } else {
        if (!key.startsWith('form')) {
          result[key] = obj[key]
        }
      }
    }

    return result
  }

  return {
    model,
    rules,
    setForm,
    flatObj
  }
}
