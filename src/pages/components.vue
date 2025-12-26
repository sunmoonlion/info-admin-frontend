<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
definePage({
  meta: {
    title: 'pages.components',
    icon: 'mdi:apps'
  },
  redirect: '/components/icon/ep-icon-list'
})
</script>

<style scoped></style>
