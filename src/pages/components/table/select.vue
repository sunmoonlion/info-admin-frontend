<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="单选" name="1">
      <VpTable
        @row-click="handleRowClick"
        :data="fixedTableData"
        :columns="fixedTableColumns"
        highlight-current-row
      >
      </VpTable>
      <p>行点击回调内容：</p>
      <p>{{ argsRef }}</p>
      <p>菜单击回调内容：</p>
      <p>{{ menuClickRef }}</p>
    </el-tab-pane>
    <el-tab-pane label="多选" name="2">
      <VpTable
        ref="multipleTableRef"
        :data="tableData"
        :columns="selectColumns"
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
      </VpTable>
      <div style="margin-top: 20px">
        <el-button @click="toggleSelection([tableData[1], tableData[2]])"
          >Toggle selection status of second and third rows</el-button
        >
        <el-button @click="toggleSelection()">Clear selection</el-button>
      </div>
      <!-- <p>行点击回调内容：</p>
      <p>{{ argsRef }}</p>
      <p>菜单击回调内容：</p>
      <p>{{ menuClickRef }}</p> -->
    </el-tab-pane>
    <el-tab-pane label="排序" name="3">
      <VpTable
        :data="tableData"
        :columns="orderColumns"
        :default-sort="{ prop: 'date', order: 'descending' }"
      >
      </VpTable>
    </el-tab-pane>
    <el-tab-pane label="过滤" name="4">
      <VpTable
        ref="filterTableRef"
        row-key="date"
        :data="filterTableData"
        :columns="filterColumns"
        :default-sort="{ prop: 'date', order: 'descending' }"
      >
      </VpTable>
      <div>
        <el-button @click="resetDateFilter">reset date filter</el-button>
        <el-button @click="clearFilter">reset all filters</el-button>
      </div>
    </el-tab-pane>
    <el-tab-pane label="自定义列模板3种写法" name="5">
      <VpTable :data="customTableData" :columns="customColumns">
        <el-table-column label="Operations">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </VpTable>
    </el-tab-pane>
    <el-tab-pane label="自定义表头" name="6">
      <VpTable :data="filterTableData1" :columns="customColumns1"> </VpTable>
    </el-tab-pane>
    <el-tab-pane label="展开行" name="7">
      switch parent border: <el-switch v-model="parentBorder" /> switch child border:
      <el-switch v-model="childBorder" />
      <VpTable :border="parentBorder" :data="expandTableData" :columns="expandTableColumns">
      </VpTable>
    </el-tab-pane>
    <el-tab-pane label="树形菜单" name="8">
      <VpTable :data="treeTableData" :columns="treeTableColumns" default-expand-all row-key="id">
      </VpTable>
    </el-tab-pane>
    <el-tab-pane label="表尾合计行" name="9">
      <VpTable :data="sumTableData" :columns="sumTableColumns" border show-summary> </VpTable>
      <VpTable
        :data="sumTableData"
        border
        height="200"
        :summary-method="getSummaries"
        show-summary
        :columns="sumTableColumns"
      >
      </VpTable>
    </el-tab-pane>
    <el-tab-pane label="合并行或列" name="10">
      <VpTable
        :data="sumTableData"
        :columns="sumTableColumns"
        :span-method="arraySpanMethod"
        border
        style="width: 100%"
      >
      </VpTable>

      <VpTable
        :data="sumTableData"
        :columns="sumTableColumns"
        :span-method="objectSpanMethod"
        border
        style="width: 100%; margin-top: 20px"
      >
      </VpTable>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="tsx">
import type { VpTableColumnType } from 'el-admin-components'
import { ElTable } from 'element-plus'
import PopOver from './Popover.vue'

interface User {
  id?: string | number
  date: string
  name: string
  address: string
  tag?: string
  children?: User[]
}

definePage({
  meta: {
    title: 'pages.table-select',
    icon: 'fluent:select-all-on-24-regular',
    order: 150,
    keepAlive: true
  }
})

const activeName = ref('1')
const argsRef = ref()
const menuClickRef = ref()

// 单选与多选
const fixedTableColumns = ref([
  {
    prop: 'date',
    label: 'Date'
  },
  {
    prop: 'name',
    label: 'Name'
  },
  {
    prop: 'state',
    label: 'State'
  },
  {
    prop: 'city',
    label: 'City'
  },
  {
    prop: 'address',
    label: 'Address'
  },
  {
    prop: 'zip',
    label: 'Zip'
  },
  {
    prop: 'tag',
    label: 'Tag'
  },
  {
    prop: '',
    label: 'Operations',
    width: 120,
    fixed: 'right',
    defaultSlot: (_props) => (
      <>
        <el-button
          link
          type='primary'
          size='small'
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
            handleClick(_props, 'detail')
          }}
        >
          Detail
        </el-button>
        <el-button
          link
          type='primary'
          size='small'
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
            handleClick(_props, 'edit')
          }}
        >
          Edit
        </el-button>
      </>
    )
  }
] as VpTableColumnType[])

const fixedTableData = ref([
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  }
])

// 多选
const selectColumns = [
  {
    type: 'selection',
    width: 55
  },
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
  }
] as VpTableColumnType[]

const orderColumns = [
  {
    prop: 'date',
    label: 'Date',
    sortable: true
  },
  {
    prop: 'name',
    label: 'Name'
  },
  {
    prop: 'address',
    label: 'Address'
  }
] as VpTableColumnType[]

// 过滤示例的columns
const filterColumns = [
  {
    prop: 'date',
    label: 'Date',
    columnKey: 'date',
    sortable: true,
    filters: [
      { text: '2016-05-01', value: '2016-05-01' },
      { text: '2016-05-02', value: '2016-05-02' },
      { text: '2016-05-03', value: '2016-05-03' },
      { text: '2016-05-04', value: '2016-05-04' }
    ],
    filterMethod: (value: string, row: User, column: VpTableColumnType) => {
      const property = column['property']
      return row[property as keyof User] === value
    }
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
    prop: 'tag',
    label: 'Tag',
    filters: [
      { text: 'Home', value: 'Home' },
      { text: 'Office', value: 'Office' }
    ],
    filterMethod: (value: string, row: User) => {
      return row.tag === value
    }
  }
] as VpTableColumnType[]

const tableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-08',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-06',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-07',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  }
]

const filterTableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Home'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Office'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Home'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Office'
  }
]

const handleClick = (scope: any, event: string) => {
  const { $index, cellIndex, column, expanded, row } = scope
  menuClickRef.value = `Event ${event}: \n $index: ${$index}, \n cellIndex: ${cellIndex}, \n column: ${JSON.stringify(
    column
  )}, \n expanded: ${expanded}, \n row: ${JSON.stringify(row)}`
}

const handleRowClick = (...args: any[]) => {
  argsRef.value = args
}

// 多选表格
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])
const toggleSelection = (rows?: User[]) => {
  if (rows) {
    rows.forEach((row) => {
      // TODO: improvement typing when refactor table
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      multipleTableRef.value!.toggleRowSelection(row, undefined)
    })
  } else {
    multipleTableRef.value!.clearSelection()
  }
}
const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val
}

// 过滤表格
const filterTableRef = ref()
const resetDateFilter = () => {
  filterTableRef.value!.clearFilter(['date'])
}
// TODO: improvement typing when refactor table
const clearFilter = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  filterTableRef.value!.clearFilter()
}

// 自定义的列模板
const customColumns = [
  // 第一种用法
  {
    label: 'Date',
    defaultSlot: (scope: any) => (
      <div style='display: flex; align-items: center'>
        <el-icon>
          <timer />
        </el-icon>
        <span style='margin-left: 10px'>{scope.row.date}</span>
      </div>
    )
  },
  // 第二种用法，Component
  {
    label: 'Name',
    defaultSlot: (scope) => {
      const { row } = scope
      return h(PopOver, {
        row
      })
    }
  }
] as VpTableColumnType[]

const customTableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  }
]
const handleEdit = (index: number, row: User) => {
  console.log(index, row)
}
const handleDelete = (index: number, row: User) => {
  console.log(index, row)
}

// 自定义表头
const search = ref('')

// 自定义的列模板
const tableDataHead: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'John',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Morgan',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Jessy',
    address: 'No. 189, Grove St, Los Angeles'
  }
]

const filterTableData1 = computed(() =>
  tableDataHead.filter(
    (data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const customColumns1 = [
  // 第一种用法
  {
    label: 'Date',
    prop: 'date'
  },
  {
    label: 'Name',
    prop: 'name'
  },
  {
    align: 'right',
    defaultSlot: (scope) => (
      <>
        <el-button size='small' onClick={handleEdit(scope.$index, scope.row)}>
          Edit
        </el-button>
        <el-button size='small' type='danger' onClick={handleDelete(scope.$index, scope.row)}>
          Delete
        </el-button>
      </>
    ),
    headerSlot: () => (
      <el-input
        modelValue={search.value}
        onInput={(e: string) => (search.value = e)}
        size='small'
        placeholder='Type to search'
      />
    )
  }
] as VpTableColumnType[]

// 展开行
const parentBorder = ref(false)
const childBorder = ref(false)
const expandTableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'San Francisco',
    address: '3650 21st St, San Francisco',
    zip: 'CA 94114',
    family: [
      {
        name: 'Jerry',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Spike',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Tyke',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      }
    ]
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'San Francisco',
    address: '3650 21st St, San Francisco',
    zip: 'CA 94114',
    family: [
      {
        name: 'Jerry',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Spike',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Tyke',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      }
    ]
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'San Francisco',
    address: '3650 21st St, San Francisco',
    zip: 'CA 94114',
    family: [
      {
        name: 'Jerry',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Spike',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Tyke',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      }
    ]
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'San Francisco',
    address: '3650 21st St, San Francisco',
    zip: 'CA 94114',
    family: [
      {
        name: 'Jerry',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Spike',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Tyke',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      }
    ]
  },
  {
    date: '2016-05-08',
    name: 'Tom',
    state: 'California',
    city: 'San Francisco',
    address: '3650 21st St, San Francisco',
    zip: 'CA 94114',
    family: [
      {
        name: 'Jerry',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Spike',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Tyke',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      }
    ]
  },
  {
    date: '2016-05-06',
    name: 'Tom',
    state: 'California',
    city: 'San Francisco',
    address: '3650 21st St, San Francisco',
    zip: 'CA 94114',
    family: [
      {
        name: 'Jerry',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Spike',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Tyke',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      }
    ]
  },
  {
    date: '2016-05-07',
    name: 'Tom',
    state: 'California',
    city: 'San Francisco',
    address: '3650 21st St, San Francisco',
    zip: 'CA 94114',
    family: [
      {
        name: 'Jerry',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Spike',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      },
      {
        name: 'Tyke',
        state: 'California',
        city: 'San Francisco',
        address: '3650 21st St, San Francisco',
        zip: 'CA 94114'
      }
    ]
  }
]

const childColumns = [
  { label: 'Name', prop: 'name' },
  { label: 'State', prop: 'state' },
  { label: 'City', prop: 'city' },
  { label: 'Address', prop: 'address' },
  { label: 'Zip', prop: 'zip' }
] as VpTableColumnType[]

const childComponent = (data: any) => (
  <>
    <v-table data={data} columns={childColumns} border={childBorder.value}></v-table>
  </>
)

const expandTableColumns = [
  {
    type: 'expand',
    defaultSlot: ({ row }) => (
      <div>
        <p>State: {row.state}</p>
        <p>City: {row.city}</p>
        <p>Address: {row.address}</p>
        <p>Zip: {row.zip}</p>
        <h3>Family</h3>
        {childComponent(row.family)}
      </div>
    )
  },
  {
    label: 'Date',
    prop: 'date'
  },
  {
    label: 'Name',
    prop: 'name'
  }
] as VpTableColumnType[]

// 树形菜单
const treeTableData: User[] = [
  {
    id: 1,
    date: '2016-05-02',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    id: 2,
    date: '2016-05-04',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    id: 3,
    date: '2016-05-01',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
    children: [
      {
        id: 31,
        date: '2016-05-01',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: 32,
        date: '2016-05-01',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  },
  {
    id: 4,
    date: '2016-05-03',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles'
  }
]

const treeTableColumns = [
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
  }
] as VpTableColumnType[]

// 合计功能
interface Product {
  id: string
  name: string
  amount1: string
  amount2: string
  amount3: number
}

interface SummaryMethodProps<T = Product> {
  columns: VpTableColumnType[]
  data: T[]
}

const sumTableColumns = [
  {
    label: 'ID',
    prop: 'id',
    width: 180
  },
  {
    label: 'Name',
    prop: 'name'
  },
  {
    label: 'Amount 1',
    prop: 'amount1',
    sortable: true
  },
  {
    label: 'Amount 2',
    prop: 'amount2',
    sortable: true
  },
  {
    label: 'Amount 3',
    prop: 'amount3',
    sortable: true
  }
] as VpTableColumnType[]

const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = 'Total Cost'
      return
    }
    const values = data.map((item) => Number(item[column.property as keyof Product]))
    if (!values.every((value) => Number.isNaN(value))) {
      sums[index] = `$ ${values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!Number.isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)}`
    } else {
      sums[index] = 'N/A'
    }
  })

  return sums
}

const sumTableData = [
  {
    id: '12987122',
    name: 'Tom',
    amount1: '234',
    amount2: '3.2',
    amount3: 10
  },
  {
    id: '12987123',
    name: 'Tom',
    amount1: '165',
    amount2: '4.43',
    amount3: 12
  },
  {
    id: '12987124',
    name: 'Tom',
    amount1: '324',
    amount2: '1.9',
    amount3: 9
  },
  {
    id: '12987125',
    name: 'Tom',
    amount1: '621',
    amount2: '2.2',
    amount3: 17
  },
  {
    id: '12987126',
    name: 'Tom',
    amount1: '539',
    amount2: '4.1',
    amount3: 15
  }
]

// 合并行或列
interface SpanMethodProps {
  row: User
  column: VpTableColumnType
  rowIndex: number
  columnIndex: number
}

const arraySpanMethod = ({ row, column, rowIndex, columnIndex }: SpanMethodProps) => {
  if (rowIndex % 2 === 0) {
    if (columnIndex === 0) {
      return [1, 2]
    } else if (columnIndex === 1) {
      return [0, 0]
    }
  }
}

const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 0) {
    if (rowIndex % 2 === 0) {
      return {
        rowspan: 2,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}

const handleDragRowChange = (rows: any[]) => {
  console.log('🚀 ~ file: select.vue:1014 ~ handleDragRowChange ~ rows:', rows)
}
</script>

<style scoped></style>
