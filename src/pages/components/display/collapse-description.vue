<template>
  <VpDescription title="个人信息" border :column="3" :data="data"></VpDescription>
</template>

<script setup lang="ts">
import type { VpDescriptionItem } from 'el-admin-components'

definePage({
  meta: {
    title: 'pages.display.description',
    icon: 'carbon:collapse-all'
  }
})

const data = ref([
  {
    label: '姓名',
    value: 'Investment Admin',
    icon: {
      icon: 'mdi:user',
      class: 'text-xl'
    }
  },
  {
    label: '电话',
    value: '1340000000'
  },
  {
    label: '年龄',
    value: 18
  },
  {
    label: '性别',
    value: '男',
    tag: {
      type: 'success'
    }
  },
  {
    label: '学校',
    value: '西安交大',
    span: 2
  },
  {
    label: '个人主页',
    value: '点击访问',
    link: {
      href: 'https://www.sunmoonai.com',
      type: 'warning'
    }
  }
] as VpDescriptionItem[])
</script>

<route lang="yaml">
meta:
  layout: default
</route>

<style scoped></style>
