'use client'

import Image from 'next/image'
import { useState } from 'react'

export type AvatarUser = {
  id: string
  label: string
  imageUrl?: string
}

export function AvatarList({ users, max = 4 }: { users: readonly AvatarUser[]; max?: number }) {
  const visible = users.slice(0, max)
  const remaining = Math.max(0, users.length - visible.length)
  return (
    <div className="avatar-list" aria-label="Participants">
      {visible.map((user) => (
        <span className="avatar" key={user.id} title={user.label}>
          {user.imageUrl ? (
            <Image src={user.imageUrl} alt="" width={40} height={40} />
          ) : (
            user.label.slice(0, 1).toUpperCase()
          )}
          <span className="sr-only">{user.label}</span>
        </span>
      ))}
      {remaining ? <span className="avatar avatar-overflow">+{remaining}</span> : null}
    </div>
  )
}

export function AvatarMenu({
  label,
  actions,
}: {
  label: string
  actions: readonly { key: string; label: string; onSelect(): void }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="avatar-menu">
      <button type="button" className="avatar" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label.slice(0, 1).toUpperCase()}
        <span className="sr-only">{label}</span>
      </button>
      {open ? (
        <div role="menu" className="avatar-menu-popup">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              onClick={() => {
                action.onSelect()
                setOpen(false)
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
