'use client'

export function ContractUpload({
  label,
  accept,
  maxBytes,
  onSelect,
}: {
  label: string
  accept: string
  maxBytes: number
  onSelect(file: File): void
}) {
  return (
    <label className="contract-upload">
      <span>{label}</span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          if (!file) return
          if (file.size > maxBytes) {
            event.currentTarget.setCustomValidity(`File exceeds ${maxBytes} bytes`)
            event.currentTarget.reportValidity()
            return
          }
          event.currentTarget.setCustomValidity('')
          onSelect(file)
        }}
      />
    </label>
  )
}
