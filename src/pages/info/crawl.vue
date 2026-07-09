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
          <el-form-item label="可信度">
            <el-select v-model="sourceForm.trust_level">
              <el-option label="Unknown" value="unknown" />
              <el-option label="Official" value="official" />
              <el-option label="Partner" value="partner" />
              <el-option label="Media" value="media" />
              <el-option label="Community" value="community" />
              <el-option label="Low" value="low" />
            </el-select>
          </el-form-item>
          <el-form-item label="版权状态">
            <el-select v-model="sourceForm.copyright_status">
              <el-option label="Unknown" value="unknown" />
              <el-option label="Licensed" value="licensed" />
              <el-option label="Public Domain" value="public_domain" />
              <el-option label="Attribution" value="attribution_required" />
              <el-option label="Restricted" value="restricted" />
            </el-select>
          </el-form-item>
          <el-form-item label="License URL">
            <el-input v-model="sourceForm.license_url" />
          </el-form-item>
          <el-form-item label="Terms URL">
            <el-input v-model="sourceForm.terms_url" />
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

    <div class="workspace">
      <section>
        <div class="toolbar">
          <el-input v-model="keyword" clearable placeholder="关键词" />
          <el-button :loading="loading" @click="loadDocuments">刷新</el-button>
        </div>

        <el-table :data="documents" height="420" highlight-current-row @row-click="selectDocument">
          <el-table-column prop="title" label="标题" min-width="260" show-overflow-tooltip />
          <el-table-column prop="source_name" label="来源" width="140" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="110" />
          <el-table-column prop="updated_at" label="更新时间" width="180" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="selectDocument(row)">治理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <aside class="governance-panel">
        <el-empty v-if="!selectedDocument" description="选择文档后治理" />
        <template v-else>
          <div class="panel-heading">
            <div class="panel-title">{{ selectedDocument.title }}</div>
            <el-tag size="small">{{ selectedDocument.status }}</el-tag>
          </div>

          <el-tabs v-model="governanceTab">
            <el-tab-pane label="审核" name="review">
              <el-form label-width="88px" class="compact-form">
                <el-form-item label="文档状态">
                  <el-select v-model="reviewForm.status">
                    <el-option label="Draft" value="draft" />
                    <el-option label="Reviewed" value="reviewed" />
                    <el-option label="Rejected" value="rejected" />
                    <el-option label="Archived" value="archived" />
                  </el-select>
                </el-form-item>
                <el-form-item label="审核人">
                  <el-input v-model="reviewForm.reviewer" />
                </el-form-item>
                <el-form-item label="原因">
                  <el-input v-model="reviewForm.reason" type="textarea" :rows="2" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="loading" @click="reviewDocument">
                    保存审核
                  </el-button>
                </el-form-item>
              </el-form>

              <el-table :data="versions" height="180">
                <el-table-column prop="version_no" label="版本" width="70" />
                <el-table-column prop="extraction_status" label="抽取" width="100" />
                <el-table-column prop="created_at" label="创建时间" min-width="170" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="selectedVersionId = row.id">
                      选中
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="画像" name="profile">
              <el-form label-width="88px" class="compact-form">
                <el-form-item label="公司">
                  <el-input v-model="entityText.companies" placeholder="逗号分隔" />
                </el-form-item>
                <el-form-item label="证券">
                  <el-input v-model="entityText.securities" placeholder="逗号分隔" />
                </el-form-item>
                <el-form-item label="行业">
                  <el-input v-model="entityText.industries" placeholder="逗号分隔" />
                </el-form-item>
                <el-form-item label="主题">
                  <el-input v-model="entityText.topics" placeholder="逗号分隔" />
                </el-form-item>
                <el-form-item label="摘要">
                  <el-input v-model="summaryForm.summary" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item label="标签">
                  <el-input v-model="summaryForm.tags" placeholder="逗号分隔" />
                </el-form-item>
                <el-form-item label="重要性">
                  <el-input-number v-model="summaryForm.importance_score" :min="0" :max="1" :step="0.1" />
                </el-form-item>
                <el-form-item>
                  <el-button :loading="loading" @click="saveEntityLinks">保存实体</el-button>
                  <el-button type="primary" :loading="loading" @click="saveSummaryProfile">
                    保存画像
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="分发" name="distribution">
              <el-form label-width="88px" class="compact-form">
                <el-form-item label="版本">
                  <el-select v-model="selectedVersionId" placeholder="选择版本">
                    <el-option
                      v-for="version in versions"
                      :key="version.id"
                      :label="`v${version.version_no} · ${version.extraction_status}`"
                      :value="version.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="数据集">
                  <el-input v-model="distributionDataset" placeholder="默认可留空" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="loading" @click="createDistribution">
                    创建分发
                  </el-button>
                  <el-button :loading="loading" @click="loadDistributions">刷新</el-button>
                </el-form-item>
              </el-form>

              <el-table :data="distributions" height="220">
                <el-table-column prop="status" label="状态" width="100" />
                <el-table-column prop="target_dataset" label="数据集" width="120" show-overflow-tooltip />
                <el-table-column prop="last_error" label="错误" min-width="160" show-overflow-tooltip />
                <el-table-column label="操作" width="140">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="dispatchDistribution(row.id)">
                      投递
                    </el-button>
                    <el-button
                      link
                      type="warning"
                      :disabled="row.status !== 'failed'"
                      @click="retryDistribution(row.id)"
                    >
                      重试
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </template>
      </aside>
    </div>

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
  current_version_id?: string
  metadata_json: Record<string, unknown>
  updated_at: string
}

interface DocumentVersionItem {
  id: string
  version_no: number
  extraction_status: string
  created_at: string
}

interface DistributionItem {
  id: string
  target_dataset?: string
  status: string
  last_error?: string
}

const apiBase = import.meta.env.VITE_API_URL || ''
const activeTab = ref('url')
const loading = ref(false)
const message = ref('')
const keyword = ref('')
const documents = ref<DocumentItem[]>([])
const selectedDocument = ref<DocumentItem>()
const versions = ref<DocumentVersionItem[]>([])
const distributions = ref<DistributionItem[]>([])
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<UploadFile>()
const selectedVersionId = ref('')
const governanceTab = ref('review')
const distributionDataset = ref('')

const urlForm = reactive({
  target_url: '',
  enqueue: true
})

const sourceForm = reactive({
  code: '',
  name: '',
  source_type: 'website',
  base_url: '',
  trust_level: 'unknown',
  copyright_status: 'unknown',
  license_url: '',
  terms_url: ''
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
const reviewForm = reactive({
  status: 'reviewed',
  reviewer: '',
  reason: ''
})
const entityText = reactive({
  companies: '',
  securities: '',
  industries: '',
  topics: ''
})
const summaryForm = reactive({
  summary: '',
  tags: '',
  importance_score: 0.5,
  importance_reason: ''
})

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

async function selectDocument(document: DocumentItem) {
  selectedDocument.value = document
  reviewForm.status = document.status || 'reviewed'
  selectedVersionId.value = document.current_version_id || ''
  hydrateProfileForm(document.metadata_json || {})
  await Promise.all([loadVersions(document.id), loadDistributions()])
}

async function loadVersions(documentId: string) {
  versions.value = await request<DocumentVersionItem[]>(`/documents/${documentId}/versions`)
  if (!selectedVersionId.value && versions.value.length > 0) {
    selectedVersionId.value = versions.value[0].id
  }
}

async function loadDistributions() {
  if (!selectedVersionId.value) {
    distributions.value = []
    return
  }
  const query = `?document_version_id=${encodeURIComponent(selectedVersionId.value)}`
  distributions.value = await request<DistributionItem[]>(`/admin/distributions${query}`)
}

async function reviewDocument() {
  if (!selectedDocument.value) return
  await run(async () => {
    const updated = await request<DocumentItem>(`/documents/${selectedDocument.value!.id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewForm)
    })
    selectedDocument.value = updated
    message.value = '审核已保存'
    await loadDocuments()
  })
}

async function saveEntityLinks() {
  if (!selectedDocument.value) return
  await run(async () => {
    const updated = await request<DocumentItem>(
      `/documents/${selectedDocument.value!.id}/entity-links`,
      {
        method: 'POST',
        body: JSON.stringify({
          companies: splitList(entityText.companies),
          securities: splitList(entityText.securities),
          industries: splitList(entityText.industries),
          topics: splitList(entityText.topics)
        })
      }
    )
    selectedDocument.value = updated
    message.value = '实体链接已保存'
    await loadDocuments()
  })
}

async function saveSummaryProfile() {
  if (!selectedDocument.value) return
  await run(async () => {
    const updated = await request<DocumentItem>(
      `/documents/${selectedDocument.value!.id}/summary-profile`,
      {
        method: 'POST',
        body: JSON.stringify({
          summary: summaryForm.summary || null,
          tags: splitList(summaryForm.tags),
          importance_score: summaryForm.importance_score,
          importance_reason: summaryForm.importance_reason || null
        })
      }
    )
    selectedDocument.value = updated
    message.value = '摘要画像已保存'
    await loadDocuments()
  })
}

async function createDistribution() {
  if (!selectedVersionId.value) {
    ElMessage.warning('请选择文档版本')
    return
  }
  await run(async () => {
    await request('/admin/distributions/knowledge', {
      method: 'POST',
      body: JSON.stringify({
        document_version_id: selectedVersionId.value,
        target_dataset: distributionDataset.value || null,
        dispatch: false
      })
    })
    message.value = '分发记录已创建'
    await loadDistributions()
  })
}

async function dispatchDistribution(distributionId: string) {
  await run(async () => {
    await request(`/admin/distributions/${distributionId}/dispatch`, { method: 'POST' })
    message.value = '分发已投递'
    await loadDistributions()
  })
}

async function retryDistribution(distributionId: string) {
  await run(async () => {
    await request(`/admin/distributions/${distributionId}/retry`, { method: 'POST' })
    message.value = '分发已重置为待投递'
    await loadDistributions()
  })
}

function splitList(value: string): string[] {
  return value
    .split(/[,\n，]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function hydrateProfileForm(metadata: Record<string, unknown>) {
  entityText.companies = asListText(metadata.companies)
  entityText.securities = asListText(metadata.securities)
  entityText.industries = asListText(metadata.industries)
  entityText.topics = asListText(metadata.topics)
  summaryForm.summary = typeof metadata.summary === 'string' ? metadata.summary : ''
  summaryForm.tags = asListText(metadata.tags)
  summaryForm.importance_score =
    typeof metadata.importance_score === 'number' ? metadata.importance_score : 0.5
  summaryForm.importance_reason =
    typeof metadata.importance_reason === 'string' ? metadata.importance_reason : ''
}

function asListText(value: unknown): string {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string').join(', ') : ''
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

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 16px;
  align-items: start;
}

.governance-panel {
  border-left: 1px solid var(--el-border-color);
  padding-left: 16px;
  min-width: 0;
}

.panel-heading {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.panel-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-form {
  max-width: 100%;
}

.mt-3 {
  margin-top: 12px;
}

@media (max-width: 1180px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .governance-panel {
    border-left: 0;
    border-top: 1px solid var(--el-border-color);
    padding-left: 0;
    padding-top: 16px;
  }
}
</style>

<route lang="yaml">
meta:
  layout: default
</route>
