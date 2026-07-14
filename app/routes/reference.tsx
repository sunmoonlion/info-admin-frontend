import {
  Button,
  Card,
  Drawer,
  Input,
  Space,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { useMemo, useState } from "react";

import {
  AuditedActionModal,
  ContractUpload,
  DataTable,
  ResourceDescription,
  type UploadReceipt,
} from "~/components/crud";
import { appConfig } from "~/lib/config";
import { downloadBlob } from "~/lib/download";

interface ReferenceRow {
  id: string;
  name: string;
  status: "ready" | "pending" | "failed";
  owner: string;
  updatedAt: string;
}

const rows: ReferenceRow[] = [
  {
    id: "ref-001",
    name: "Contract client",
    status: "ready",
    owner: "Platform",
    updatedAt: "2026-07-11",
  },
  {
    id: "ref-002",
    name: "Async operation",
    status: "pending",
    owner: "Worker",
    updatedAt: "2026-07-10",
  },
  {
    id: "ref-003",
    name: "Failure handling",
    status: "failed",
    owner: "Operator",
    updatedAt: "2026-07-09",
  },
];

const statusColor = { ready: "green", pending: "gold", failed: "red" } as const;

export function meta() {
  return [{ title: `参考页面 · ${appConfig.name}` }];
}

export default function ReferencePage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReferenceRow | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [uploaded, setUploaded] = useState<UploadReceipt | null>(null);
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        row.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const columns: TableColumnsType<ReferenceRow> = [
    {
      title: "ID",
      dataIndex: "id",
      render: (value: string) => (
        <Typography.Text code>{value}</Typography.Text>
      ),
    },
    { title: "名称", dataIndex: "name" },
    {
      title: "状态",
      dataIndex: "status",
      render: (value: ReferenceRow["status"]) => (
        <Tag color={statusColor[value]}>{value}</Tag>
      ),
    },
    { title: "负责人", dataIndex: "owner" },
    { title: "更新时间", dataIndex: "updatedAt" },
    {
      title: "操作",
      key: "actions",
      render: (_, row) => (
        <Button type="link" onClick={() => setSelected(row)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <Typography.Text type="secondary">Reference pattern</Typography.Text>
          <Typography.Title level={1}>表格与操作参考页</Typography.Title>
          <Typography.Paragraph type="secondary">
            对应 Vue/Element Plus 中常见的筛选、Table、Tag、Drawer、Modal 和
            Form。
          </Typography.Paragraph>
        </div>
        <Space>
          <Button
            onClick={() =>
              downloadBlob(
                new Blob([JSON.stringify(rows, null, 2)], {
                  type: "application/json",
                }),
                "reference-fixture.json",
              )
            }
          >
            下载 fixture
          </Button>
          <Button type="primary" onClick={() => setReasonOpen(true)}>
            新建操作
          </Button>
        </Space>
      </header>

      <Card>
        <Space wrap className="reference-toolbar">
          <Input.Search
            allowClear
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="筛选名称"
          />
          <Button onClick={() => setQuery("")}>重置</Button>
        </Space>
        <DataTable<ReferenceRow>
          rowKey="id"
          columns={columns}
          data={filtered}
          scroll={{ x: 760 }}
          emptyText="没有符合条件的数据"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Card title="上传适配器">
          <Space orientation="vertical" align="start">
          <Typography.Text type="secondary">
            业务 App 通过 adapter 注入真实上传接口；模板不持有领域 URL 或凭据。
          </Typography.Text>
          <ContractUpload
            accept=".json,.txt"
            uploadFile={async (file) => ({
              assetId: `fixture-${file.name}`,
              filename: file.name,
              size: file.size,
            })}
            onUploaded={setUploaded}
          />
          {uploaded && (
            <Typography.Text type="success">
              已接收 {uploaded.filename}（{uploaded.size} bytes）
            </Typography.Text>
          )}
        </Space>
      </Card>

      <Drawer
        title="操作详情"
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="large"
      >
        {selected && (
          <ResourceDescription
            column={1}
            bordered
            size="small"
            items={[
              { key: "id", label: "ID", children: selected.id },
              { key: "name", label: "名称", children: selected.name },
              {
                key: "status",
                label: "状态",
                children: (
                  <Tag color={statusColor[selected.status]}>
                    {selected.status}
                  </Tag>
                ),
              },
              { key: "owner", label: "负责人", children: selected.owner },
            ]}
          />
        )}
      </Drawer>

      <AuditedActionModal
        open={reasonOpen}
        onCancel={() => setReasonOpen(false)}
        onConfirm={async () => setReasonOpen(false)}
      />
    </section>
  );
}
