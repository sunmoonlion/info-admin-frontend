import type { Directive } from 'vue'

const scrollText: Directive = {
  mounted(el, binding) {
    el.style.overflow = 'hidden'
    el.style.whiteSpace = 'nowrap'

    // let maxScrollLeft = el.scrollWidth - el.clientWidth
    const duration = binding?.value?.duration || 10000
    const delay = binding?.value?.delay || 2000

    const noreverse = binding.modifiers.noreverse

    el.__state = {
      animating: true,
      oldScrollLeft: 0,
      start: 0,
      direction: true,
      maxScrollLeft: el.scrollWidth - el.clientWidth
    }

    function step(timestamp) {
      if (!(el.__state && el.__state.animating)) return

      const { oldScrollLeft, maxScrollLeft, direction } = el.__state

      if (!el.__state.start) el.__state.start = timestamp

      const { start } = el.__state

      // 开始延迟
      if (timestamp < start + delay) {
        requestAnimationFrame(step)
        return
      }

      const rate = maxScrollLeft / duration
      const progress = timestamp - start

      let currentScroll
      if (direction) {
        currentScroll = (progress - delay) * rate + oldScrollLeft
      } else {
        let offset = 0
        if (oldScrollLeft) {
          offset = maxScrollLeft - oldScrollLeft
        }
        currentScroll = (duration + delay - progress) * rate - offset
      }
      el.scrollLeft = currentScroll
      if (currentScroll >= maxScrollLeft || currentScroll < 0) {
        // 调整滚动的方向
        if (!noreverse) el.__state.direction = !direction
        el.__state.start = 0
        el.__state.oldScrollLeft = 0
      }

      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)

    el.__resizeHandler = () => {
      el.__state.maxScrollLeft = el.scrollWidth - el.clientWidth
      if (el.__state.maxScrollLeft <= 0) {
        el.__state.start = 0
        el.scrollLeft = 0
        el.__state.direction = true
      }
    }

    el.__pauseScroll = () => {
      el.__state.animating = false
      el.__state.oldScrollLeft = el.scrollLeft
    }

    el.__resumeScroll = () => {
      if (!el.__state.animating) {
        el.__state.animating = true
        el.__state.start = 0
        requestAnimationFrame(step)
      }
    }

    // 鼠标移入 & 点击事件（兼容移动端）
    window.addEventListener('resize', el.__resizeHandler)
    el.addEventListener('mouseover', el.__pauseScroll)
    el.addEventListener('touchstart', el.__pauseScroll)

    el.addEventListener('mouseleave', el.__resumeScroll)
    el.addEventListener('touchend', el.__resumeScroll)
  },
  updated(el) {
    const newScrollWidth = el.scrollWidth - el.clientWidth
    if (el.__state.maxScrollLeft !== newScrollWidth) {
      el.__state.maxScrollLeft = newScrollWidth
      el.__state.start = 0
      el.__state.direction = true
      el.__state.oldScrollLeft = 0

      el.scrollLeft = 0
    }
  },
  beforeUnmount(el) {
    el.__state.animating = false
    el.__state = null
    el.scrollLeft = 0
    if (el.__resizeHandler) window.removeEventListener('resize', el.__resizeHandler)

    el.removeEventListener('mouseover', el.__pauseScroll)
    el.removeEventListener('touchstart', el.__pauseScroll)

    el.removeEventListener('mouseleave', el.__resumeScroll)
    el.removeEventListener('touchend', el.__resumeScroll)
  }
}

export default scrollText
