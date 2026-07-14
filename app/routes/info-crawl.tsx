import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tabs,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  AuditedActionModal,
  ContractUpload,
  DataTable,
  ResourceDescription,
  crudMutationHeaders,
  useCrudMutation,
  useCrudNotifications,
} from "~/components/crud";
import {
  infoApi,
  type InfoCollector,
  type InfoDistribution,
  type InfoDocument,
  type InfoDocumentVersion,
} from "~/lib/info-api";

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

const statusColor: Record<string, string> = {
  draft: "blue",
  reviewed: "green",
  rejected: "red",
  archived: "default",
  pending: "gold",
  running: "processing",
  succeeded: "green",
  failed: "red",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function listText(value: unknown): string {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").join(", ")
    : "";
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "操作失败，请提供发生时间和 correlation id。";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

type AuditAction =
  | "review"
  | "batch-review"
  | "entity-links"
  | "summary-profile"
  | "dispatch"
  | "retry";

interface SourceForm {
  code: string;
  name: string;
  source_type: string;
  base_url: string;
  trust_level: string;
  copyright_status: string;
  license_url: string;
  terms_url: string;
}

const initialSource: SourceForm = {
  code: "",
  name: "",
  source_type: "website",
  base_url: "",
  trust_level: "unknown",
  copyright_status: "unknown",
  license_url: "",
  terms_url: "",
};

export function meta() {
  return [{ title: "资讯采集与治理" }];
}

export default function InfoCrawlPage() {
  const queryClient = useQueryClient();
  const notifications = useCrudNotifications();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [selectedDocument, setSelectedDocument] = useState<InfoDocument | null>(
    null,
  );
  const [selectedRows, setSelectedRows] = useState<InfoDocument[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [distributionStatus, setDistributionStatus] = useState<
    string | undefined
  >();
  const [distributionDataset, setDistributionDataset] = useState("");
  const [distributionDetail, setDistributionDetail] =
    useState<InfoDistribution | null>(null);
  const [auditAction, setAuditAction] = useState<AuditAction | null>(null);
  const [pendingDistributionId, setPendingDistributionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState("");
  const [enqueue, setEnqueue] = useState(true);
  const [sourceForm, setSourceForm] = useState<SourceForm>(initialSource);
  const [collectorForm, setCollectorForm] = useState({
    code: "",
    name: "",
    collector_type: "rss",
    url: "",
    config: '{\n  "feed_url": "https://example.com/rss.xml"\n}',
  });
  const [lastCollector, setLastCollector] = useState<InfoCollector | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [reviewStatus, setReviewStatus] = useState("reviewed");
  const [entityText, setEntityText] = useState({
    companies: "",
    securities: "",
    industries: "",
    topics: "",
  });
  const [summaryForm, setSummaryForm] = useState({
    summary: "",
    tags: "",
    importance_score: 0.5,
    importance_reason: "",
  });

  const documentsQuery = useQuery({
    queryKey: ["info", "documents", keyword, status],
    queryFn: () => infoApi.listDocuments({ keyword, status }),
  });
  const documents = documentsQuery.data ?? [];

  const versionsQuery = useQuery({
    queryKey: ["info", "versions", selectedDocument?.id],
    queryFn: () => infoApi.listVersions(selectedDocument!.id),
    enabled: Boolean(selectedDocument),
  });
  const versions = versionsQuery.data ?? [];
  const activeVersionId = selectedVersionId || versions[0]?.id || "";

  const distributionsQuery = useQuery({
    queryKey: ["info", "distributions", activeVersionId, distributionStatus],
    queryFn: () => infoApi.listDistributions(activeVersionId, distributionStatus),
    enabled: Boolean(activeVersionId),
  });
  const distributions = distributionsQuery.data ?? [];

  function selectDocument(document: InfoDocument) {
    setSelectedDocument(document);
    setSelectedVersionId(document.current_version_id ?? "");
    const metadata = asRecord(document.metadata_json);
    const links = asRecord(metadata.entity_links);
    const profile = asRecord(metadata.summary_profile);
    setEntityText({
      companies: listText(links.companies),
      securities: listText(links.securities),
      industries: listText(links.industries),
      topics: listText(links.topics),
    });
    setSummaryForm({
      summary: typeof profile.summary === "string" ? profile.summary : "",
      tags: listText(profile.tags),
      importance_score:
        typeof profile.importance_score === "number"
          ? profile.importance_score
          : 0.5,
      importance_reason:
        typeof profile.importance_reason === "string"
          ? profile.importance_reason
          : "",
    });
    setReviewStatus(document.status || "reviewed");
  }

  async function runAction(action: () => Promise<void>, success: string) {
    setBusy(true);
    try {
      await action();
      notifications.success(success);
    } catch (error) {
      notifications.error("操作失败", errorText(error));
    } finally {
      setBusy(false);
    }
  }

  const reviewMutation = useCrudMutation(async (context) => {
    if (!selectedDocument) throw new Error("请先选择文档");
    return infoApi.reviewDocument(
      selectedDocument.id,
      { status: reviewStatus, reason: context.reason ?? "" },
      crudMutationHeaders(context),
    );
  });
  const batchReviewMutation = useCrudMutation(async (context) => {
    if (!selectedRows.length) throw new Error("请先选择文档");
    return Promise.all(
      selectedRows.map((document) =>
        infoApi.reviewDocument(
          document.id,
          { status: reviewStatus, reason: context.reason ?? "" },
          crudMutationHeaders(context),
        ),
      ),
    );
  });
  const entityMutation = useCrudMutation(async (context) => {
    if (!selectedDocument) throw new Error("请先选择文档");
    return infoApi.updateEntityLinks(
      selectedDocument.id,
      {
        companies: splitList(entityText.companies),
        securities: splitList(entityText.securities),
        industries: splitList(entityText.industries),
        topics: splitList(entityText.topics),
        reason: context.reason,
      },
      crudMutationHeaders(context),
    );
  });
  const summaryMutation = useCrudMutation(async (context) => {
    if (!selectedDocument) throw new Error("请先选择文档");
    return infoApi.updateSummaryProfile(
      selectedDocument.id,
      {
        summary: summaryForm.summary || undefined,
        tags: splitList(summaryForm.tags),
        importance_score: summaryForm.importance_score,
        importance_reason: summaryForm.importance_reason || undefined,
        reason: context.reason,
      },
      crudMutationHeaders(context),
    );
  });
  const distributionMutation = useCrudMutation(async (context) => {
    if (!pendingDistributionId) throw new Error("分发记录不存在");
    return infoApi.dispatchDistribution(
      pendingDistributionId,
      crudMutationHeaders(context),
    );
  });
  const retryMutation = useCrudMutation(async (context) => {
    if (!pendingDistributionId) throw new Error("分发记录不存在");
    return infoApi.retryDistribution(
      pendingDistributionId,
      crudMutationHeaders(context),
    );
  });

  async function refreshDocuments() {
    await queryClient.invalidateQueries({ queryKey: ["info", "documents"] });
  }

  async function confirmAudit(reason: string) {
    try {
      if (auditAction === "review") {
        await reviewMutation.execute({ reason });
        await refreshDocuments();
        notifications.success("审核已保存");
      } else if (auditAction === "batch-review") {
        await batchReviewMutation.execute({ reason });
        setSelectedRows([]);
        await refreshDocuments();
        notifications.success(`已批量审核 ${selectedRows.length} 篇文档`);
      } else if (auditAction === "entity-links") {
        const updated = await entityMutation.execute({ reason });
        selectDocument(updated);
        await refreshDocuments();
        notifications.success("实体链接已保存");
      } else if (auditAction === "summary-profile") {
        const updated = await summaryMutation.execute({ reason });
        selectDocument(updated);
        await refreshDocuments();
        notifications.success("摘要画像已保存");
      } else if (auditAction === "dispatch") {
        await distributionMutation.execute({ reason });
        await queryClient.invalidateQueries({ queryKey: ["info", "distributions"] });
        notifications.success("分发已投递");
      } else if (auditAction === "retry") {
        await retryMutation.execute({ reason });
        await queryClient.invalidateQueries({ queryKey: ["info", "distributions"] });
        notifications.success("分发已重置为待投递");
      }
      setAuditAction(null);
    } catch (error) {
      notifications.error("操作失败", errorText(error));
    }
  }

  const documentColumns: TableColumnsType<InfoDocument> = [
    {
      title: "标题",
      dataIndex: "title",
      render: (value: string, row) => (
        <Button type="link" onClick={() => selectDocument(row)}>
          {value || "未命名文档"}
        </Button>
      ),
    },
    { title: "来源", dataIndex: "source_name", render: (value: string | null) => value || "-" },
    {
      title: "状态",
      dataIndex: "status",
      render: (value: string) => <Tag color={statusColor[value]}>{value}</Tag>,
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      render: (value: string) => formatDate(value),
    },
  ];

  const versionColumns: TableColumnsType<InfoDocumentVersion> = [
    { title: "版本", dataIndex: "version_no", width: 80, render: (v) => `v${v}` },
    { title: "抽取", dataIndex: "extraction_status", width: 120 },
    { title: "创建时间", dataIndex: "created_at", render: (value: string) => formatDate(value) },
    {
      title: "操作",
      key: "select",
      width: 90,
      render: (_, row) => (
        <Button type="link" onClick={() => setSelectedVersionId(row.id)}>
          选中
        </Button>
      ),
    },
  ];

  const distributionColumns: TableColumnsType<InfoDistribution> = [
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: string) => <Tag color={statusColor[value]}>{value}</Tag>,
    },
    { title: "数据集", dataIndex: "target_dataset", render: (v: string | null) => v || "默认" },
    { title: "更新时间", dataIndex: "updated_at", render: (value: string) => formatDate(value) },
    { title: "错误", dataIndex: "last_error", ellipsis: true, render: (v: string | null) => v || "-" },
    {
      title: "操作",
      key: "actions",
      width: 220,
      render: (_, row) => (
        <Space size={0}>
          <Button type="link" onClick={() => setDistributionDetail(row)}>
            详情
          </Button>
          <Button
            type="link"
            onClick={() => {
              setPendingDistributionId(row.id);
              setAuditAction("dispatch");
            }}
          >
            投递
          </Button>
          <Button
            type="link"
            disabled={row.status !== "failed"}
            onClick={() => {
              setPendingDistributionId(row.id);
              setAuditAction("retry");
            }}
          >
            重试
          </Button>
        </Space>
      ),
    },
  ];

  const selectedMetadata = useMemo(
    () => (selectedDocument ? asRecord(selectedDocument.metadata_json) : {}),
    [selectedDocument],
  );
  const auditLog = Array.isArray(selectedMetadata.audit_log)
    ? selectedMetadata.audit_log
    : [];

  return (
    <section className="page-stack info-crawl-page">
      <header className="page-header">
        <div>
          <Typography.Text type="secondary">Info Admin</Typography.Text>
          <Typography.Title level={1}>资讯采集与治理</Typography.Title>
          <Typography.Paragraph type="secondary">
            真实对接 Info 后端的采集、审核、画像和 Knowledge 分发工作台。
          </Typography.Paragraph>
        </div>
        <Button onClick={() => void refreshDocuments()} loading={documentsQuery.isFetching}>
          刷新数据
        </Button>
      </header>

      <Tabs
        items={[
          {
            key: "crawl",
            label: "URL 采集",
            children: (
              <Card>
                <Space orientation="vertical" style={{ width: "100%" }} size="middle">
                  <Input
                    value={crawlUrl}
                    onChange={(event) => setCrawlUrl(event.target.value)}
                    placeholder="https://example.com/news"
                    addonBefore="URL"
                  />
                  <Space>
                    <Button
                      type={enqueue ? "primary" : "default"}
                      onClick={() => setEnqueue((value) => !value)}
                    >
                      {enqueue ? "立即入队：是" : "立即入队：否"}
                    </Button>
                    <Button
                      type="primary"
                      loading={busy}
                      disabled={!crawlUrl.trim()}
                      onClick={() =>
                        void runAction(
                          async () => {
                            await infoApi.createCrawlJob({ target_url: crawlUrl.trim(), enqueue });
                          },
                          "采集任务已创建",
                        )
                      }
                    >
                      创建任务
                    </Button>
                  </Space>
                </Space>
              </Card>
            ),
          },
          {
            key: "source",
            label: "来源",
            children: (
              <Card>
                <Row gutter={[12, 12]}>
                  {(
                    [
                      ["code", "编码"],
                      ["name", "名称"],
                      ["base_url", "Base URL"],
                      ["license_url", "License URL"],
                      ["terms_url", "Terms URL"],
                    ] as const
                  ).map(([field, label]) => (
                    <Col xs={24} md={12} key={field}>
                      <Input
                        addonBefore={label}
                        value={sourceForm[field]}
                        onChange={(event) =>
                          setSourceForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                      />
                    </Col>
                  ))}
                  <Col xs={24} md={12}>
                    <Select
                      style={{ width: "100%" }}
                      value={sourceForm.source_type}
                      options={[
                        { label: "Website", value: "website" },
                        { label: "RSS", value: "rss" },
                        { label: "API", value: "api" },
                      ]}
                      onChange={(value) => setSourceForm((current) => ({ ...current, source_type: value }))}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Select
                      style={{ width: "100%" }}
                      value={sourceForm.trust_level}
                      options={["unknown", "official", "partner", "media", "community", "low"].map((value) => ({ label: value, value }))}
                      onChange={(value) => setSourceForm((current) => ({ ...current, trust_level: value }))}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Select
                      style={{ width: "100%" }}
                      value={sourceForm.copyright_status}
                      options={["unknown", "licensed", "public_domain", "attribution_required", "restricted"].map((value) => ({ label: value, value }))}
                      onChange={(value) => setSourceForm((current) => ({ ...current, copyright_status: value }))}
                    />
                  </Col>
                </Row>
                <Button
                  type="primary"
                  loading={busy}
                  disabled={!sourceForm.code.trim() || !sourceForm.name.trim()}
                  style={{ marginTop: 16 }}
                    onClick={() =>
                      void runAction(
                      async () => {
                        await infoApi.createSource({ ...sourceForm });
                      },
                      "来源已保存",
                    )
                  }
                >
                  保存来源
                </Button>
              </Card>
            ),
          },
          {
            key: "collector",
            label: "Collector",
            children: (
              <Card>
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}>
                    <Input
                      addonBefore="编码"
                      value={collectorForm.code}
                      onChange={(event) => setCollectorForm((current) => ({ ...current, code: event.target.value }))}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Input
                      addonBefore="名称"
                      value={collectorForm.name}
                      onChange={(event) => setCollectorForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Select
                      style={{ width: "100%" }}
                      value={collectorForm.collector_type}
                      options={["rss", "api", "changedetection", "scrapy", "playwright"].map((value) => ({ label: value, value }))}
                      onChange={(value) => setCollectorForm((current) => ({ ...current, collector_type: value }))}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Input
                      addonBefore="URL"
                      value={collectorForm.url}
                      onChange={(event) => setCollectorForm((current) => ({ ...current, url: event.target.value }))}
                    />
                  </Col>
                  <Col span={24}>
                    <Input.TextArea
                      rows={5}
                      value={collectorForm.config}
                      onChange={(event) => setCollectorForm((current) => ({ ...current, config: event.target.value }))}
                      placeholder="JSON 配置"
                    />
                  </Col>
                </Row>
                <Space style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    loading={busy}
                    disabled={!collectorForm.code.trim() || !collectorForm.name.trim()}
                    onClick={() =>
                      void runAction(async () => {
                        let config: Record<string, unknown>;
                        try {
                          config = JSON.parse(collectorForm.config || "{}");
                        } catch {
                          throw new Error("Collector 配置不是有效 JSON");
                        }
                        if (collectorForm.url && !config.url && !config.feed_url) config.url = collectorForm.url;
                        const collector = await infoApi.createCollector({
                          code: collectorForm.code,
                          name: collectorForm.name,
                          collector_type: collectorForm.collector_type,
                          config,
                        });
                        setLastCollector(collector);
                      }, "Collector 已保存")
                    }
                  >
                    保存 Collector
                  </Button>
                  <Button
                    disabled={!lastCollector}
                    loading={busy}
                    onClick={() =>
                      lastCollector &&
                      void runAction(
                        () => infoApi.discoverCollector(lastCollector.id, collectorForm.url || undefined).then(() => undefined),
                        "发现任务已创建",
                      )
                    }
                  >
                    发现任务
                  </Button>
                </Space>
              </Card>
            ),
          },
          {
            key: "upload",
            label: "上传",
            children: (
              <Card>
                <Space orientation="vertical" align="start">
                  <Input
                    addonBefore="标题"
                    value={uploadTitle}
                    onChange={(event) => setUploadTitle(event.target.value)}
                    placeholder="可选"
                  />
                  <ContractUpload
                    accept=".txt,.md,.html,.pdf,.doc,.docx"
                    uploadFile={async (file) => {
                      const receipt = await infoApi.uploadDocument(file, uploadTitle || undefined);
                      await refreshDocuments();
                      return {
                        assetId: receipt.document_id,
                        filename: file.name,
                        size: file.size,
                      };
                    }}
                  />
                  <Typography.Text type="secondary">
                    文件选择后立即上传，服务端负责抽取和 artifact 校验。
                  </Typography.Text>
                </Space>
              </Card>
            ),
          },
        ]}
      />

      <Divider />
      <Card
        title="文档工作区"
        extra={
          <Space>
            <Input.Search
              allowClear
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={(value) => setKeyword(value.trim())}
              placeholder="关键词"
            />
            <Select
              allowClear
              value={status}
              onChange={setStatus}
              options={statusOptions}
              placeholder="全部状态"
              style={{ width: 140 }}
            />
          </Space>
        }
      >
        <DataTable<InfoDocument>
          rowKey="id"
          columns={documentColumns}
          data={documents}
          loading={documentsQuery.isLoading || documentsQuery.isFetching}
          error={documentsQuery.error}
          onRetry={() => void documentsQuery.refetch()}
          scroll={{ x: 760 }}
          rowSelection={{
            selectedRowKeys: selectedRows.map((row) => row.id),
            onChange: (_keys, rows) => setSelectedRows(rows),
          }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          emptyText="暂无文档"
        />
      </Card>

      {selectedDocument ? (
        <Card
          title={
            <Space>
              <span>{selectedDocument.title || "未命名文档"}</span>
              <Tag color={statusColor[selectedDocument.status]}>{selectedDocument.status}</Tag>
            </Space>
          }
          extra={<Typography.Text type="secondary">{selectedDocument.id}</Typography.Text>}
        >
          <Tabs
            items={[
              {
                key: "review",
                label: "审核",
                children: (
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Space wrap>
                      <Select value={reviewStatus} options={statusOptions} onChange={setReviewStatus} style={{ width: 150 }} />
                      <Button type="primary" onClick={() => setAuditAction("review")}>保存审核</Button>
                      <Button disabled={!selectedRows.length} onClick={() => setAuditAction("batch-review")}>批量审核 {selectedRows.length || ""}</Button>
                    </Space>
                    {versionsQuery.error ? <Alert type="error" message={errorText(versionsQuery.error)} /> : null}
                    <DataTable<InfoDocumentVersion>
                      rowKey="id"
                      columns={versionColumns}
                      data={versions}
                      loading={versionsQuery.isLoading}
                      emptyText="暂无版本"
                      pagination={false}
                    />
                  </Space>
                ),
              },
              {
                key: "profile",
                label: "画像与实体",
                children: (
                  <Row gutter={[12, 12]}>
                    {([
                      ["companies", "公司"],
                      ["securities", "证券"],
                      ["industries", "行业"],
                      ["topics", "主题"],
                    ] as const).map(([field, label]) => (
                      <Col xs={24} md={12} key={field}>
                        <Input
                          addonBefore={label}
                          value={entityText[field]}
                          placeholder="逗号分隔"
                          onChange={(event) => setEntityText((current) => ({ ...current, [field]: event.target.value }))}
                        />
                      </Col>
                    ))}
                    <Col span={24}><Typography.Text strong>摘要</Typography.Text><Input.TextArea rows={3} value={summaryForm.summary} onChange={(event) => setSummaryForm((current) => ({ ...current, summary: event.target.value }))} /></Col>
                    <Col xs={24} md={12}><Input addonBefore="标签" value={summaryForm.tags} placeholder="逗号分隔" onChange={(event) => setSummaryForm((current) => ({ ...current, tags: event.target.value }))} /></Col>
                    <Col xs={24} md={12}><InputNumber addonBefore="重要性" min={0} max={1} step={0.1} value={summaryForm.importance_score} onChange={(value) => setSummaryForm((current) => ({ ...current, importance_score: value ?? 0.5 }))} style={{ width: "100%" }} /></Col>
                    <Col span={24}><Typography.Text strong>重要性理由</Typography.Text><Input.TextArea rows={2} value={summaryForm.importance_reason} onChange={(event) => setSummaryForm((current) => ({ ...current, importance_reason: event.target.value }))} /></Col>
                    <Col span={24}><Space><Button onClick={() => setAuditAction("entity-links")}>保存实体链接</Button><Button type="primary" onClick={() => setAuditAction("summary-profile")}>保存摘要画像</Button></Space></Col>
                  </Row>
                ),
              },
              {
                key: "distribution",
                label: "Knowledge 分发",
                children: (
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Space wrap>
                      <Select value={activeVersionId || undefined} placeholder="选择版本" options={versions.map((version) => ({ label: `v${version.version_no} · ${version.extraction_status}`, value: version.id }))} onChange={setSelectedVersionId} style={{ width: 220 }} />
                      <Input value={distributionDataset} onChange={(event) => setDistributionDataset(event.target.value)} placeholder="目标数据集（可选）" />
                      <Select allowClear value={distributionStatus} onChange={setDistributionStatus} options={["pending", "running", "failed", "succeeded"].map((value) => ({ label: value, value }))} placeholder="全部状态" style={{ width: 140 }} />
                      <Button type="primary" disabled={!activeVersionId} loading={busy} onClick={() => void runAction(async () => { await infoApi.createDistribution(activeVersionId, distributionDataset || undefined); await queryClient.invalidateQueries({ queryKey: ["info", "distributions"] }); }, "分发记录已创建")}>创建分发</Button>
                    </Space>
                    <DataTable<InfoDistribution>
                      rowKey="id"
                      columns={distributionColumns}
                      data={distributions}
                      loading={distributionsQuery.isLoading || distributionsQuery.isFetching}
                      error={distributionsQuery.error}
                      onRetry={() => void distributionsQuery.refetch()}
                      pagination={false}
                      emptyText={activeVersionId ? "暂无分发记录" : "请先选择版本"}
                      scroll={{ x: 850 }}
                    />
                  </Space>
                ),
              },
              {
                key: "audit",
                label: "审计",
                children: auditLog.length ? <pre className="info-json-preview">{JSON.stringify(auditLog, null, 2)}</pre> : <Empty description="暂无审计记录" />,
              },
              {
                key: "details",
                label: "详情",
                children: <ResourceDescription column={1} bordered size="small" items={[{ key: "url", label: "规范 URL", children: selectedDocument.canonical_url || "-" }, { key: "source", label: "来源", children: selectedDocument.source_name || "-" }, { key: "updated", label: "更新时间", children: formatDate(selectedDocument.updated_at) }, { key: "hash", label: "内容哈希", children: selectedDocument.content_hash || "-" }]} />,
              },
            ]}
          />
        </Card>
      ) : (
        <Card><Empty description="选择文档后进入治理工作区" /></Card>
      )}

      <Modal title="分发详情" open={Boolean(distributionDetail)} onCancel={() => setDistributionDetail(null)} footer={null}>
        {distributionDetail ? <ResourceDescription column={1} bordered items={[{ key: "id", label: "ID", children: distributionDetail.id }, { key: "status", label: "状态", children: <Tag color={statusColor[distributionDetail.status]}>{distributionDetail.status}</Tag> }, { key: "dataset", label: "数据集", children: distributionDetail.target_dataset || "默认" }, { key: "updated", label: "更新时间", children: formatDate(distributionDetail.updated_at) }, { key: "error", label: "错误", children: distributionDetail.last_error || "-" }, { key: "payload", label: "Payload", children: <pre className="info-json-preview">{JSON.stringify(distributionDetail.payload || {}, null, 2)}</pre> }]} /> : null}
      </Modal>

      <AuditedActionModal
        open={Boolean(auditAction)}
        title={auditAction === "batch-review" ? "确认批量审核" : "确认受审计操作"}
        actionLabel="确认执行"
        confirming={[
          reviewMutation,
          batchReviewMutation,
          entityMutation,
          summaryMutation,
          distributionMutation,
          retryMutation,
        ].some((mutation) => mutation.status === "running")}
        onCancel={() => setAuditAction(null)}
        onConfirm={confirmAudit}
      />
    </section>
  );
}
