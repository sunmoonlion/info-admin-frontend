<template>
  <div
    v-waterMarker="{ text: 'Investment Admin CSR', textColor: 'rgba(180, 180, 180, 0.6)' }"
    class="flex flex-col items-center h-full pt-20 text-lg font-bold"
  >
    <span>水印指令示例</span>
  </div>
</template>

<script setup lang="ts">
definePage({
  meta: {
    title: 'pages.directive.watermark',
    icon: 'ic:outline-branding-watermark'
  }
})
</script>

<style lang="scss" scoped></style>
