<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
definePage({
  meta: {
    title: 'pages.players',
    icon: 'bi:music-player',
    order: 300
  },
  redirect: '/components/players/video'
})
</script>

<style scoped></style>
