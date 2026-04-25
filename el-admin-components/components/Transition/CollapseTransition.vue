<template>
  <transition
    name="collapse"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
  >
    <slot></slot>
  </transition>
</template>

<script setup lang="ts">
defineProps({
  duration: {
    type: String,
    default: '0.3s'
  }
})

function beforeEnter(el: Element) {
  const h = el as HTMLElement
h.dataset.oldPaddingTop = h.style.paddingTop
  h.dataset.oldPaddingBottom = h.style.paddingBottom
  h.style.height = '0'
  h.style.paddingTop = '0'
  h.style.paddingBottom = '0'
}

function enter(el: Element) {
  const h = el as HTMLElement
  h.dataset.oldOverflow = h.style.overflow
  if (h.scrollHeight !== 0) {
    h.style.height = h.scrollHeight + 'px'
    h.style.paddingTop = h.dataset.oldPaddingTop ?? ''
    h.style.paddingBottom = h.dataset.oldPaddingBottom ?? ''
  } else {
    h.style.height = ''
    h.style.paddingTop = h.dataset.oldPaddingTop ?? ''
    h.style.paddingBottom = h.dataset.oldPaddingBottom ?? ''
  }
  h.style.overflow = 'hidden'
}

function afterEnter(el: Element) {
  const h = el as HTMLElement
  h.style.height = ''
  h.style.overflow = h.dataset.oldOverflow ?? ''
}

function beforeLeave(el: Element) {
  const h = el as HTMLElement
h.dataset.oldPaddingTop = h.style.paddingTop
  h.dataset.oldPaddingBottom = h.style.paddingBottom
  h.dataset.oldOverflow = h.style.overflow
  h.style.height = h.scrollHeight + 'px'
  h.style.overflow = 'hidden'
}

function leave(el: Element) {
  const h = el as HTMLElement
  if (h.scrollHeight !== 0) {
    h.style.height = '0'
    h.style.paddingTop = '0'
    h.style.paddingBottom = '0'
  }
}

function afterLeave(el: Element) {
  const h = el as HTMLElement
  h.style.height = ''
  h.style.overflow = h.dataset.oldOverflow ?? ''
  h.style.paddingTop = h.dataset.oldPaddingTop ?? ''
  h.style.paddingBottom = h.dataset.oldPaddingBottom ?? ''
}
</script>

<style scoped lang="scss">
.collapse-enter-active,
.collapse-leave-active {
  transition: all v-bind(duration) ease-in-out;
}
</style>
