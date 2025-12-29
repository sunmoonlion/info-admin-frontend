# Investment Admin CSR

基于 Vue 3 + Vite + TypeScript + Element Plus 的现代化管理后台系统（客户端渲染）。

## 简介

这是一个功能完整的管理后台系统，采用最新的前端技术栈构建，支持桌面端和移动端，具备完整的用户权限管理、数据可视化、文件上传等功能。

## 技术栈

- **框架**: Vue 3.5.13
- **构建工具**: Vite 6.0.11
- **语言**: TypeScript 5.7.3
- **UI库**: Element Plus 2.9.3
- **状态管理**: Pinia 2.3.1
- **路由**: Vue Router 4.5.0
- **样式**: UnoCSS 65.4.3 + Sass 1.83.4
- **国际化**: Vue I18n 9.6.5
- **图表**: ECharts 5.6.0
- **桌面端**: Electron 28.0.0
- **PWA**: Vite PWA 0.21.1

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 9.15.4
- 现代浏览器支持

## 配置

### 环境变量
项目支持多环境配置，主要环境变量包括：

- `VITE_MOCK_ENABLE`: 是否启用Mock数据
- `VITE_PWA_DEBUG`: 是否启用PWA调试
- `ELECTRON`: 是否启用Electron模式
- `BASE_PATH`: 生产环境基础路径

### 目录结构

```
investment-admin-frontend/
├── src/
│   ├── assets/              # 静态资源
│   │   ├── icons/          # SVG图标
│   │   ├── images/         # 图片资源
│   │   └── styles/         # 样式文件
│   ├── components/         # 通用组件
│   ├── layouts/            # 布局组件
│   │   ├── default.vue     # 默认布局
│   │   ├── single-page.vue # 单页布局
│   │   └── 404.vue         # 404页面
│   ├── pages/              # 页面组件
│   │   ├── components/     # 组件展示页面
│   │   ├── directives/     # 指令展示页面
│   │   ├── menus/          # 菜单页面
│   │   └── index.vue       # 首页
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   │   ├── index.ts        # 主store
│   │   ├── tabs.ts         # 标签页状态
│   │   └── user.ts         # 用户状态
│   ├── utils/              # 工具函数
│   └── modules/            # 功能模块
├── electron/               # Electron主进程
│   ├── main/               # 主进程代码
│   └── preload/            # 预加载脚本
├── locales/                # 国际化文件
├── mock/                   # Mock数据
├── public/                 # 公共资源
└── dist/                   # 构建输出
```

## 核心功能

### 1. 用户界面
- 响应式设计，支持桌面端和移动端
- 暗色/亮色主题切换
- 国际化支持（中文/英文）
- 侧边栏菜单导航
- 面包屑导航
- 标签页管理

### 2. 组件展示
- **表单组件**: 各种输入控件、验证规则
- **表格组件**: 数据表格、分页、排序、筛选
- **图表组件**: ECharts集成，支持多种图表类型
- **编辑器**: 富文本编辑器、Markdown编辑器
- **播放器**: 音频播放器、视频播放器
- **通知组件**: 消息提示、通知中心

### 3. 指令系统
- 复制指令
- 防抖/节流指令
- 拖拽指令
- 长按指令
- 滚动文字指令
- 水印指令

### 4. 桌面应用
- Electron集成
- 原生菜单
- 系统托盘
- 自动更新

### 5. PWA支持
- 离线缓存
- 安装提示
- 后台同步

## 脚本说明

### 开发环境
```bash
# 启动开发服务器
pnpm dev

# 启动Electron桌面应用
pnpm dev:desktop
```

### 构建部署
```bash
# 构建生产版本
pnpm build

# 构建Electron应用
pnpm build:electron

# 预览构建结果
pnpm preview
```

### 测试
```bash
# 单元测试
pnpm test:unit

# E2E测试
pnpm test:e2e

# E2E测试开发模式
pnpm test:e2e:dev
```

### 代码质量
```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check
```

### 分析工具
```bash
# 构建分析
pnpm analysis

# 调试构建
pnpm build:debug
```

## 部署相关

### Docker部署
项目包含完整的Docker配置：

```bash
# 开发环境
docker-compose -f docker-compose.yml up

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### 静态部署
支持多种静态部署平台：
- Netlify
- Vercel
- GitHub Pages
- 传统服务器

### CDN优化
生产环境自动启用CDN加速，支持以下库的CDN替换：
- Vue
- Element Plus
- ECharts
- Vue Router
- Pinia
- 其他第三方库

## 开发指南

### el-admin-components 使用示例

项目集成了 `el-admin-components` 组件库，通过 `unplugin-vue-components` 自动导入，无需手动导入即可使用。

#### 1. 表格组件 (VpTable)

```vue
<template>
  <VpTable
    :columns="columns"
    :data="tableData"
    :pagination="pagination"
    @page-current-change="handlePageChange"
  />
</template>

<script setup lang="ts">
import type { VpTableColumnType, VpPaginationType } from 'el-admin-components'

const columns = ref([
  { prop: 'date', label: 'Date' },
  { prop: 'name', label: 'Name' },
  { prop: 'address', label: 'Address' }
] as VpTableColumnType[])

const pagination = ref({
  total: 100,
  pageSizes: [10, 20, 30, 50],
  layout: 'total, sizes, prev, pager, next, jumper'
} as VpPaginationType)

const tableData = ref([
  { date: '2016-05-03', name: 'Tom', address: 'No. 189, Grove St' }
])
</script>
```

#### 2. 表单组件 (VpForm)

```vue
<template>
  <VpForm v-model="model" :schema="schema" ref="formRef">
    <template #actions>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </template>
  </VpForm>
</template>

<script setup lang="ts">
import type { VpFormSchema } from 'el-admin-components'

const schema = ref([
  {
    prop: 'name',
    value: '',
    label: '活动名称',
    type: 'input',
    rules: [
      { required: true, message: '请输入活动名称', trigger: 'blur' }
    ]
  },
  {
    prop: 'region',
    value: '',
    label: '活动区域',
    type: 'select',
    children: [
      { label: '区域一', value: 'shanghai' },
      { label: '区域二', value: 'beijing' }
    ]
  }
] as VpFormSchema[])

const model = ref({})
</script>
```

#### 3. 描述列表组件 (VpDescription)

```vue
<template>
  <VpDescription title="个人信息" border :column="3" :data="data" />
</template>

<script setup lang="ts">
import type { VpDescriptionItem } from 'el-admin-components'

const data = ref([
  {
    label: '姓名',
    value: 'Investment Admin',
    icon: { icon: 'mdi:user', class: 'text-xl' }
  },
  {
    label: '电话',
    value: '1340000000'
  },
  {
    label: '性别',
    value: '男',
    tag: { type: 'success' }
  }
] as VpDescriptionItem[])
</script>
```

#### 4. 图标选择器 (VpIconPicker)

```vue
<template>
  <VpIconPicker @submit="handleSubmit" />
</template>

<script setup lang="ts">
import type { VpIconPickerSubmitDataProps } from 'el-admin-components'

const handleSubmit = (data: VpIconPickerSubmitDataProps) => {
  const { icon, fontSize, color } = data
  console.log('选中的图标:', icon)
}
</script>
```

#### 5. 视频播放器 (VpVideoPlayer)

```vue
<template>
  <VpVideoPlayer :options="options" />
</template>

<script setup lang="ts">
import type { VpVideoPlayerOptions } from 'el-admin-components'

const options = ref({
  sources: [
    {
      src: 'https://example.com/video.mp4',
      type: 'video/mp4'
    }
  ]
} as VpVideoPlayerOptions)
</script>
```

#### 6. 组合式函数

组件库还提供了多个组合式函数，可通过自动导入使用：

```typescript
// useForm - 表单处理
import { useForm } from 'el-admin-components'

// useMenu - 菜单处理
import { useMenu } from 'el-admin-components'

// useAudioPlayer - 音频播放器
import { useAudioPlayer } from 'el-admin-components'

// useDrag - 拖拽功能
import { useDrag } from 'el-admin-components'
```

更多组件和 API 请参考 [el-admin-components 文档](https://github.com/el-admin-components/el-admin-components)。

### 添加新页面
1. 在 `src/pages/` 目录下创建Vue组件
2. 路由会自动根据文件结构生成
3. 如需自定义路由，可在组件中使用 `<route>` 块

### 添加新组件
1. 在 `src/components/` 目录下创建组件
2. 组件会自动注册，无需手动导入
3. 支持TypeScript类型提示

### 状态管理
使用Pinia进行状态管理：
- `store/index.ts`: 主store配置
- `store/user.ts`: 用户相关状态
- `store/tabs.ts`: 标签页状态

### 国际化
1. 在 `locales/` 目录下添加语言文件
2. 使用 `$t()` 函数进行翻译
3. 支持动态语言切换

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License