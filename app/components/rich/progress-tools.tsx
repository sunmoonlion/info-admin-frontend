export function ProgressBar({ label, value }: { label: string; value: number }) {
  const normalized = Math.min(100, Math.max(0, value))
  return (
    <div className="progress-tool">
      <div className="progress-label"><span>{label}</span><span>{normalized}%</span></div>
      <progress value={normalized} max={100}>{normalized}%</progress>
    </div>
  )
}

export function Watermark({ text, children }: { text: string; children: React.ReactNode }) {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="100"><text x="10" y="55" fill="rgba(120,120,120,.18)" transform="rotate(-20 90 50)" font-size="14">${escapeXml(text)}</text></svg>`,
  )
  return <div className="watermark" style={{ backgroundImage: `url("data:image/svg+xml,${encoded}")` }}>{children}</div>
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] ?? character)
}
