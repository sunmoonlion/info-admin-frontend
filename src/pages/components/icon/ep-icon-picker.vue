<template>
  <el-row class="mb-4">
    支持所有Iconify sets：
    <el-link href="https://icon-sets.iconify.design/" target="_blank">Iconify</el-link>
  </el-row>
  <div class="mb-4">直接使用 icon=&quot;{collection}:{name}&quot; 的方式进行使用</div>
  <div class="mb-4">
    <span class="mr-2">当前图标：</span>
    <Icon :icon="iconRef" :style="style" />
    <span class="ml-2 text-gray-500">{{ iconRef }}</span>
  </div>
  <div class="mb-4">
    <el-alert
      v-if="iconRef"
      :title="iconCode"
      type="info"
      :closable="false"
      show-icon
    />
  </div>
  <VpIconPicker @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { VpIconPickerSubmitDataProps } from 'el-admin-components'
import type { CSSProperties } from 'vue'

definePage({
  meta: {
    title: 'pages.pick-icon',
    icon: 'healthicons:i-exam-multiple-choice'
  }
})

const iconRef = ref('ep:qian')
const style = ref<CSSProperties>({})

const iconCode = computed(() => {
  return `图标代码: <i class="i-${iconRef.value}"></i>`
})

const handleSubmit = (data: VpIconPickerSubmitDataProps) => {
  const { icon, fontSize, color } = data
  iconRef.value = icon
  style.value = {
    fontSize: fontSize ? `${fontSize}px` : undefined,
    color: color || undefined
  }
}
</script>

<style scoped></style>
