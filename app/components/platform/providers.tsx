'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeController } from '@/components/admin/theme-controller'
import { FeedbackProvider } from '@/components/crud/feedback'

export function PlatformProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeController />
      <FeedbackProvider>{children}</FeedbackProvider>
    </QueryClientProvider>
  )
}
