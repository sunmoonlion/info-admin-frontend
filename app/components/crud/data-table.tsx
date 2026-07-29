'use client'

export type DataColumn<Row> = {
  key: string
  header: string
  render(row: Row): React.ReactNode
}

type DataTableProps<Row> = {
  caption: string
  rows: readonly Row[]
  columns: readonly DataColumn<Row>[]
  rowKey(row: Row): string
  loading?: boolean
  error?: string
  emptyLabel: string
  page: number
  pageCount: number
  onPageChange(page: number): void
}

export function DataTable<Row>({
  caption,
  rows,
  columns,
  rowKey,
  loading,
  error,
  emptyLabel,
  page,
  pageCount,
  onPageChange,
}: DataTableProps<Row>) {
  if (loading) return <div className="crud-state" aria-busy="true">Loading…</div>
  if (error) return <div className="crud-state crud-error" role="alert">{error}</div>
  return (
    <div className="crud-table-wrap">
      <table className="crud-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>{columns.map((column) => <th key={column.key} scope="col">{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={columns.length} className="crud-empty">{emptyLabel}</td></tr>
          )}
        </tbody>
      </table>
      <nav className="crud-pagination" aria-label={`${caption} pagination`}>
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>{page} / {Math.max(pageCount, 1)}</span>
        <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
      </nav>
    </div>
  )
}
