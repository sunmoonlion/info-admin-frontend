<template>
  <div class="flex items-center justify-center mt-10 mb-10">
    <el-input v-model="data" placeholder="请输入内容" class="mr-2" style="width: 500px" />
    <el-button v-copy="data" type="primary">复制</el-button>
  </div>
</template>


<script setup lang="ts">
definePage({
  meta: {
    title: 'pages.directive.copy',
    icon: 'lucide:copy'
  }
})

const data = ref<string>('我是被复制的内容')
</script>

<style lang="scss" scoped></style>
