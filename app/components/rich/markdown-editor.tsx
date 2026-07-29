'use client'

export function MarkdownEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange(value: string): void
}) {
  return (
    <div className="markdown-editor">
      <label htmlFor="markdown-source">{label}</label>
      <textarea
        id="markdown-source"
        value={value}
        maxLength={20_000}
        rows={7}
        onChange={(event) => onChange(event.target.value)}
      />
      <section aria-label={`${label} preview`}>
        <strong>Plain-text safe preview</strong>
        <pre>{value}</pre>
      </section>
    </div>
  )
}
