<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="自适应高度" name="1">
      <VpTable :data="tableData" :columns="columns" highlight-current-row :pagination="pagination" adaptive>
      </VpTable>
    </el-tab-pane>
    <el-tab-pane label="列拖拽" name="2">
      <VpTable :data="tableData" :columns="columns" highlight-current-row :pagination="pagination" draggableCol>
      </VpTable>
    </el-tab-pane>
    <el-tab-pane label="行拖拽" name="3">
      <VpTable :data="tableData" :columns="columnsWithSlots" highlight-current-row :pagination="pagination" draggable-row>
      </VpTable>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import type { VpPaginationType, VpTableColumnType } from 'el-admin-components'

definePage({
  meta: {
    title: 'pages.table-high',
    icon: 'ic:baseline-dynamic-form',
    order: 200,
    keepAlive: true
  }
})

const activeName = ref('1')

const columns = ref([
  {
    prop: 'date',
    label: 'Date'
  },
  {
    prop: 'name',
    label: 'Name'
  },
  {
    prop: 'address',
    label: 'Address'
  },
  {
    prop: 'number',
    label: 'Num'
  }
] as VpTableColumnType[])

const columnsWithSlots = ref([
  {
    prop: 'date',
    label: 'Date'
    // defaultSlot: () => 123
  },
  {
    prop: 'name',
    label: 'Name'
  },
  {
    prop: 'address',
    label: 'Address'
  },
  {
    prop: 'number',
    label: 'Num'
  }
] as VpTableColumnType[])

const col = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    number: 123
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    number: 333
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    number: 999
  }
]
const tableData = ref([...col])

const pagination = ref({
  align: 'right',
  small: false,
  background: false,
  layout: 'total, sizes, prev, pager, next, jumper',
  pagerCount: 7,
  pageSizes: [10, 20, 30, 40, 50, 100],
  total: 100
} as VpPaginationType)
</script>

<style scoped></style>
