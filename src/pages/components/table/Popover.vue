<template>
  <el-popover
    effect="light"
    trigger="hover"
    placement="top"
    width="auto"
    v-if="row && Object.keys(row).length"
  >
    <template #default>
      <div>name: {{ row.name }}</div>
      <div>address: {{ row.address }}</div>
    </template>
    <template #reference>
      <el-tag>{{ row.name }}</el-tag>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
definePage({
  meta: {
    hideMenu: true
  }
})

defineProps({
  row: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped></style>
