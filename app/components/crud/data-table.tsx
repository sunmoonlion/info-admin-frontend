import { Button, Result, Table, Typography } from "antd";
import type { TableProps } from "antd";

export interface DataTableProps<RecordType extends object>
  extends Omit<TableProps<RecordType>, "dataSource" | "loading" | "locale"> {
  data?: readonly RecordType[];
  loading?: boolean;
  error?: unknown;
  emptyText?: string;
  errorTitle?: string;
  onRetry?: () => void;
}

/**
 * Neutral table boundary for list pages. Domain code owns columns and query
 * state; this component owns loading, empty, error and retry presentation.
 */
export function DataTable<RecordType extends object>({
  data = [],
  loading = false,
  error,
  emptyText = "暂无数据",
  errorTitle = "数据加载失败",
  onRetry,
  ...tableProps
}: DataTableProps<RecordType>) {
  if (error) {
    return (
      <Result
        status="error"
        title={errorTitle}
        subTitle="请稍后重试；如果问题持续，请提供操作时间和 correlation id。"
        extra={
          onRetry ? (
            <Button type="primary" onClick={onRetry}>
              重试
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Table<RecordType>
      {...tableProps}
      dataSource={Array.from(data)}
      loading={loading}
      locale={{ emptyText: <Typography.Text>{emptyText}</Typography.Text> }}
    />
  );
}
