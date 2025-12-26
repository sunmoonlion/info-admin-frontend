<template>
  <div class="relative h-[calc(100vh-50px)]">
    <div
      v-draggable
      class="box w-[300px] h-[300px] text-3xl select-none top-1/2 left-1/2 bg-center rounded-1/2 overflow-hidden line-height-[300px] text-center text-white translate-x--1/2 translate-y--1/2"
    >
      我可以拖拽哦~
    </div>
  </div>
</template>

<script setup lang="ts">
definePage({
  meta: {
    title: 'pages.directive.drag',
    icon: 'fluent:drag-20-regular'
  }
})
</script>

<style lang="scss" scoped>
.box {
  background-image: url('https://cdn.pixabay.com/photo/2023/09/20/04/04/sea-urchin-8263832_1280.jpg');
}
</style>
