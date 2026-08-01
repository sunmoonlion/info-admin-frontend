export type MetricPoint = { label: string; value: number }

export function MetricChart({
  title,
  points,
  loading,
  error,
}: {
  title: string
  points: readonly MetricPoint[]
  loading?: boolean
  error?: string
}) {
  if (loading) return <div className="rich-state" aria-busy="true">Loading chart…</div>
  if (error) return <div className="rich-state crud-error" role="alert">{error}</div>
  if (!points.length) return <div className="rich-state">No chart data</div>
  const max = Math.max(...points.map((point) => point.value), 1)
  const width = 480
  const height = 180
  const barWidth = width / points.length
  return (
    <figure className="metric-chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        {points.map((point, index) => {
          const barHeight = Math.max(2, (point.value / max) * (height - 30))
          return (
            <g key={point.label}>
              <rect
                x={index * barWidth + 8}
                y={height - barHeight - 20}
                width={Math.max(8, barWidth - 16)}
                height={barHeight}
                rx={4}
              />
              <text x={index * barWidth + barWidth / 2} y={height - 5} textAnchor="middle">
                {point.label}
              </text>
            </g>
          )
        })}
      </svg>
      <table>
        <caption className="sr-only">{title} data</caption>
        <thead><tr><th>Label</th><th>Value</th></tr></thead>
        <tbody>{points.map((point) => <tr key={point.label}><td>{point.label}</td><td>{point.value}</td></tr>)}</tbody>
      </table>
    </figure>
  )
}
