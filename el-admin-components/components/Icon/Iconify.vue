<template>
  <component v-cloak :is="Icon" v-bind="props"></component>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { IconProps } from './types'

const props = defineProps<IconProps>()
</script>

<style scoped></style>
