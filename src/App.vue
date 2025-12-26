<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { messages, locale } = useI18n()

// if (!process.env.ELECTRON) {
//   import('./modules/pwa').then(({ registerPWA }) => {
//     registerPWA()
//   })
// }
</script>

<template>
  <el-config-provider :locale="messages[locale] as any">
    <router-view />
  </el-config-provider>
</template>

<style scoped></style>
