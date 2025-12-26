<template>
  <div class="flex items-center justify-center mt-10 mb-10">
    <el-button v-debounce="debounceClick" type="primary">防抖按钮 (0.5秒后执行)</el-button>
    <el-button v-throttle="throttleClick" type="primary">节流按钮 (每隔1S秒后执行)</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
definePage({
  meta: {
    title: 'pages.directive.debounce-throttle',
    icon: 'fluent:cursor-click-24-regular'
  }
})

const debounceClick = () => {
  ElMessage.success('防抖按钮触发事件')
}

const throttleClick = () => {
  ElMessage.success('节流按钮触发事件')
}
</script>

<style lang="scss" scoped></style>
