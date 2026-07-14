import { Empty, Result, Skeleton } from "antd";
import { useId } from "react";

export interface ChartPoint {
  label: string;
  value: number;
}

export interface MetricChartProps {
  data: readonly ChartPoint[];
  title: string;
  loading?: boolean;
  error?: boolean;
  height?: number;
  color?: string;
}

/** Small SVG chart adapter; consuming Apps may replace it with ECharts later. */
export function MetricChart({
  data,
  title,
  loading = false,
  error = false,
  height = 180,
  color = "#1677ff",
}: MetricChartProps) {
  const titleId = useId();
  if (loading) return <Skeleton active aria-label={`${title}加载中`} />;
  if (error)
    return <Result status="error" title={`${title}加载失败`} subTitle="请稍后重试" />;
  if (!data.length) return <Empty description={`${title}暂无数据`} />;

  const max = Math.max(1, ...data.map((point) => Math.max(0, point.value)));
  const barWidth = 100 / data.length;
  return (
    <figure className="rich-chart" aria-labelledby={titleId}>
      <figcaption id={titleId}>{title}</figcaption>
      <svg
        role="img"
        aria-label={title}
        viewBox={`0 0 100 60`}
        height={height}
        preserveAspectRatio="none"
      >
        {data.map((point, index) => {
          const barHeight = (Math.max(0, point.value) / max) * 48;
          return (
            <rect
              key={`${point.label}-${index}`}
              x={index * barWidth + barWidth * 0.15}
              y={55 - barHeight}
              width={barWidth * 0.7}
              height={barHeight}
              fill={color}
              rx="1"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <table className="visually-hidden">
        <caption>{title}数据</caption>
        <thead><tr><th scope="col">名称</th><th scope="col">数值</th></tr></thead>
        <tbody>
          {data.map((point) => <tr key={point.label}><th scope="row">{point.label}</th><td>{point.value}</td></tr>)}
        </tbody>
      </table>
    </figure>
  );
}
