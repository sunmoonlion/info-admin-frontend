'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type FeedbackKind = 'success' | 'error' | 'info'
type FeedbackMessage = { id: number; kind: FeedbackKind; text: string }
type FeedbackApi = { notify(kind: FeedbackKind, text: string): void }

const FeedbackContext = createContext<FeedbackApi | null>(null)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])
  const notify = useCallback((kind: FeedbackKind, text: string) => {
    const id = Date.now()
    setMessages((current) => [...current, { id, kind, text }])
    setTimeout(() => setMessages((current) => current.filter((item) => item.id !== id)), 4000)
  }, [])
  const api = useMemo(() => ({ notify }), [notify])
  return (
    <FeedbackContext.Provider value={api}>
      {children}
      <div className="feedback-region" aria-live="polite" aria-atomic="false">
        {messages.map((message) => (
          <div key={message.id} className={`feedback-message feedback-${message.kind}`}>
            {message.text}
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider')
  return context
}
