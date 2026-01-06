<script setup lang="ts">
// if (!process.env.ELECTRON) {
//   import('./modules/pwa').then(({ registerPWA }) => {
//     registerPWA()
//   })
// }
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>

<style scoped></style>
