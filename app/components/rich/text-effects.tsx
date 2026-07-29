'use client'

import { useRef, useState } from 'react'

export function FlashMessage({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  return (
    <button
      type="button"
      className={`flash-message ${active ? 'flash-message-active' : ''}`}
      onClick={() => {
        setActive(false)
        requestAnimationFrame(() => setActive(true))
        setTimeout(() => setActive(false), 700)
      }}
    >
      {children}
    </button>
  )
}

export function ScrollText({ children }: { children: string }) {
  return (
    <div className="scroll-text" tabIndex={0} title={children}>
      <span>{children}</span>
    </div>
  )
}

export function DraggableList<T>({
  items,
  itemKey,
  renderItem,
  onReorder,
}: {
  items: readonly T[]
  itemKey(item: T): string
  renderItem(item: T): React.ReactNode
  onReorder(items: T[]): void
}) {
  const dragging = useRef<number | null>(null)
  return (
    <ul className="draggable-list">
      {items.map((item, index) => (
        <li
          key={itemKey(item)}
          draggable
          tabIndex={0}
          onDragStart={() => {
            dragging.current = index
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragging.current === null || dragging.current === index) return
            const next = [...items]
            const [moved] = next.splice(dragging.current, 1)
            next.splice(index, 0, moved)
            onReorder(next)
            dragging.current = null
          }}
          onKeyDown={(event) => {
            if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return
            event.preventDefault()
            const target = event.key === 'ArrowUp' ? index - 1 : index + 1
            if (target < 0 || target >= items.length) return
            const next = [...items]
            ;[next[index], next[target]] = [next[target], next[index]]
            onReorder(next)
          }}
        >
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}
