<template>
  <div class="flex items-center justify-center mt-10 mb-10">
    <el-button v-longPress="longpress" type="primary">长按2秒触发事件</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
definePage({
  meta: {
    title: 'pages.directive.longpress',
    icon: 'icon-park-outline:press'
  }
})

const longpress = () => {
  ElMessage.success('长按事件触发成功')
}
</script>

<style lang="scss" scoped></style>
