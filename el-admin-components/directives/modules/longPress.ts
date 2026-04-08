/**
 * v-long-press
 * 长按指令，长按时触发事件
 */
import type { Directive, DirectiveBinding } from 'vue'

interface ElType extends HTMLElement {
  _unmounted?: () => void
}

const mounted = (el: ElType, binding: DirectiveBinding) => {
  if (typeof binding.value !== 'function') {
    throw 'callback must be a function'
  }
  // 定义变量
  let pressTimer: any = null
  // 创建计时器（ 2秒后执行函数 ）
  const start = (e: any) => {
    if (e.type === 'mousedown' && 'button' in e && e.button !== 0) {
      return
    }
    if (pressTimer === null) {
      pressTimer = setTimeout(() => {
        handler(e)
      }, 2000)
    }
  }
  // 取消计时器
  const cancel = () => {
    if (pressTimer !== null) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
  }
  // 运行函数
  const handler = (e: MouseEvent | TouchEvent) => {
    binding.value(e)
  }
  // 添加事件监听器
  el.addEventListener('mousedown', start)
  el.addEventListener('touchstart', start)
  // 取消计时器
  el.addEventListener('click', cancel)
  el.addEventListener('mouseout', cancel)
  el.addEventListener('touchend', cancel)
  el.addEventListener('touchcancel', cancel)

  // 移除事件监听器
  const unmounted = () => {
    el.removeEventListener('mousedown', start)
    el.removeEventListener('touchstart', start)
    el.removeEventListener('click', cancel)
    el.removeEventListener('mouseout', cancel)
    el.removeEventListener('touchend', cancel)
    el.removeEventListener('touchcancel', cancel)
  }

  el._unmounted = unmounted
}

const longPress: Directive = {
  mounted,
  beforeUnmount: (el) => el?._unmounted()
}

export default longPress
