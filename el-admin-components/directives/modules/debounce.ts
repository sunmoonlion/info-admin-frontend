import type { Directive, DirectiveBinding } from 'vue'

interface ElType extends HTMLElement {
  __handleClick: () => void
}

const debounce: Directive = {
  mounted: function (el: ElType, binding: DirectiveBinding) {
    if (typeof binding.value !== 'function') {
      throw 'callback must be a function'
    }
    let timer: number | null = null
    el.__handleClick = function () {
      if (timer) {
        clearInterval(timer)
      }
      timer = window.setTimeout(() => {
        binding.value()
      }, 500)
    }
    el.addEventListener('click', el.__handleClick)
  },
  beforeUnmount: function (el) {
    el.removeEventListener('click', el.__handleClick)
  }
}

export default debounce
