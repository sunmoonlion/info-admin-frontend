'use client'

export function ActionDrawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose(): void
}) {
  if (!open) return null
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="action-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2 id="action-drawer-title">{title}</h2>
          <button type="button" className="secondary-button" onClick={onClose}>Close</button>
        </header>
        {children}
      </aside>
    </div>
  )
}
