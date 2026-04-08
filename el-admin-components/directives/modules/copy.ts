// v-copy="data"
import type { Directive, DirectiveBinding } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'

interface ElType extends HTMLElement {
  __handleClick: () => void
  copyData?: any
}

const copy: Directive = {
  mounted: function (el: ElType, binding: DirectiveBinding) {
    el.copyData = binding.value
    const { copy } = useClipboard({ source: binding.value })
    const { modifiers } = binding
    const handleClick = () => {
      copy(el.copyData)
      !modifiers.mute &&
        ElMessage({
          type: 'success',
          message: '复制成功'
        })
    }
    el.addEventListener('click', handleClick)
    el.__handleClick = handleClick
  },
  updated: function (el, binding) {
    el.copyData = binding.value
  },
  beforeUnmount: function (el) {
    el.removeEventListener('click', el.__handleClick)
  }
}

export default copy
