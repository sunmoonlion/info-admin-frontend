<template>
  <div class="info-crawl-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="URL" name="url">
        <el-form :model="urlForm" label-width="96px" class="panel-form">
          <el-form-item label="URL">
            <el-input v-model="urlForm.target_url" placeholder="https://example.com/news" />
          </el-form-item>
          <el-form-item label="立即入队">
            <el-switch v-model="urlForm.enqueue" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="createCrawlJob">
              创建任务
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="来源" name="sources">
        <el-form :model="sourceForm" label-width="96px" class="panel-form">
          <el-form-item label="编码">
            <el-input v-model="sourceForm.code" />
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="sourceForm.name" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="sourceForm.source_type">
              <el-option label="Website" value="website" />
              <el-option label="RSS" value="rss" />
              <el-option label="API" value="api" />
            </el-select>
          </el-form-item>
          <el-form-item label="Base URL">
            <el-input v-model="sourceForm.base_url" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="createSource">
              保存来源
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="Collector" name="collector">
        <el-form :model="collectorForm" label-width="96px" class="panel-form">
          <el-form-item label="编码">
            <el-input v-model="collectorForm.code" />
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="collectorForm.name" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="collectorForm.collector_type">
              <el-option label="RSS/Atom" value="rss" />
              <el-option label="API" value="api" />
              <el-option label="Changedetection" value="changedetection" />
              <el-option label="Scrapy" value="scrapy" />
              <el-option label="Playwright" value="playwright" />
            </el-select>
          </el-form-item>
          <el-form-item label="URL">
            <el-input v-model="collectorUrl" />
          </el-form-item>
          <el-form-item label="配置">
            <el-input
              v-model="collectorConfigText"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 10 }"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="createCollector">
              保存 Collector
            </el-button>
            <el-button :disabled="!lastCollectorId" :loading="loading" @click="discoverCollector">
              发现任务
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="上传" name="upload">
        <el-form label-width="96px" class="panel-form">
          <el-form-item label="标题">
            <el-input v-model="uploadTitle" />
          </el-form-item>
          <el-form-item label="文件">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
            >
              <el-button>选择文件</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="uploadFile">上传</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-divider />

    <div class="toolbar">
      <el-input v-model="keyword" clearable placeholder="关键词" />
      <el-button :loading="loading" @click="loadDocuments">刷新</el-button>
    </div>

    <el-table :data="documents" height="360">
      <el-table-column prop="title" label="标题" min-width="260" show-overflow-tooltip />
      <el-table-column prop="source_name" label="来源" width="160" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="updated_at" label="更新时间" width="220" />
    </el-table>

    <el-alert v-if="message" class="mt-3" type="success" :closable="false" :title="message" />
  </div>
</template>

<script setup lang="ts">
import type { UploadFile, UploadInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

definePage({
  meta: {
    title: '资讯采集',
    icon: 'mdi:rss'
  }
})

interface DocumentItem {
  id: string
  title: string
  source_name?: string
  status: string
  updated_at: string
}

const apiBase = import.meta.env.VITE_API_URL || ''
const activeTab = ref('url')
const loading = ref(false)
const message = ref('')
const keyword = ref('')
const documents = ref<DocumentItem[]>([])
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<UploadFile>()

const urlForm = reactive({
  target_url: '',
  enqueue: true
})

const sourceForm = reactive({
  code: '',
  name: '',
  source_type: 'website',
  base_url: ''
})

const collectorForm = reactive({
  code: '',
  name: '',
  collector_type: 'rss'
})
const collectorUrl = ref('')
const collectorConfigText = ref('{\n  "feed_url": "https://example.com/rss.xml"\n}')
const lastCollectorId = ref('')
const uploadTitle = ref('')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}/api${path}`, {
    credentials: 'include',
    headers: init?.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...init
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || response.statusText)
  }
  return response.json() as Promise<T>
}

async function createCrawlJob() {
  await run(async () => {
    await request('/admin/crawl-jobs', {
      method: 'POST',
      body: JSON.stringify(urlForm)
    })
    message.value = '任务已创建'
    await loadDocuments()
  })
}

async function createSource() {
  await run(async () => {
    await request('/admin/sources', {
      method: 'POST',
      body: JSON.stringify(sourceForm)
    })
    message.value = '来源已保存'
  })
}

async function createCollector() {
  await run(async () => {
    const config = JSON.parse(collectorConfigText.value || '{}')
    if (collectorUrl.value && !config.url && !config.feed_url) {
      config.url = collectorUrl.value
    }
    const collector = await request<{ id: string }>('/admin/collectors', {
      method: 'POST',
      body: JSON.stringify({ ...collectorForm, config })
    })
    lastCollectorId.value = collector.id
    message.value = 'Collector 已保存'
  })
}

async function discoverCollector() {
  await run(async () => {
    await request(`/admin/collectors/${lastCollectorId.value}/discover`, {
      method: 'POST',
      body: JSON.stringify({ url: collectorUrl.value || undefined })
    })
    message.value = '发现任务已创建'
  })
}

function handleFileChange(file: UploadFile) {
  selectedFile.value = file
}

function handleFileRemove() {
  selectedFile.value = undefined
}

async function uploadFile() {
  const raw = selectedFile.value?.raw
  if (!raw) {
    ElMessage.warning('请选择文件')
    return
  }
  await run(async () => {
    const formData = new FormData()
    formData.append('file', raw)
    if (uploadTitle.value) formData.append('title', uploadTitle.value)
    await request('/admin/uploads', {
      method: 'POST',
      body: formData
    })
    uploadRef.value?.clearFiles()
    selectedFile.value = undefined
    message.value = '文件已上传'
    await loadDocuments()
  })
}

async function loadDocuments() {
  const query = keyword.value ? `?keyword=${encodeURIComponent(keyword.value)}` : ''
  documents.value = await request<DocumentItem[]>(`/documents${query}`)
}

async function run(action: () => Promise<void>) {
  loading.value = true
  message.value = ''
  try {
    await action()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadDocuments)
</script>

<style scoped>
.info-crawl-page {
  min-height: calc(100vh - 120px);
}

.panel-form {
  max-width: 760px;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 360px) auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.mt-3 {
  margin-top: 12px;
}
</style>

<route lang="yaml">
meta:
  layout: default
</route>
