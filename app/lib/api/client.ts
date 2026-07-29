'use client'

import { randomUUID } from '@/lib/browser/random-uuid'

export type ApiProblem = {
  code: string
  message_key: string
  retryable: boolean
  correlation_id: string
  field_errors?: Record<string, string[]>
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ApiProblem,
  ) {
    super(problem.message_key)
    this.name = 'ApiClientError'
  }
}

type RequestJsonOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  csrfToken?: string
  headers?: Record<string, string>
}

export async function requestJson<T>(
  path: string,
  options: RequestJsonOptions = {},
): Promise<T> {
  if (!path.startsWith('/api/')) throw new Error('API path must be same-origin and start with /api/')
  const method = (options.method ?? 'GET').toUpperCase()
  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  const correlationId = randomUUID()
  const response = await fetch(path, {
    ...options,
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    redirect: 'manual',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: {
      Accept: 'application/json',
      'X-Correlation-ID': correlationId,
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(unsafe && options.csrfToken ? { 'X-CSRF-Token': options.csrfToken } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const payload = await safeJson(response)
    throw new ApiClientError(response.status, normalizeProblem(payload, correlationId))
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function normalizeProblem(payload: unknown, fallbackCorrelationId: string): ApiProblem {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      code: 'unexpected_response',
      message_key: 'errors.unexpected',
      retryable: false,
      correlation_id: fallbackCorrelationId,
    }
  }
  const candidate = payload as Record<string, unknown>
  return {
    code: typeof candidate.code === 'string' ? candidate.code : 'request_failed',
    message_key:
      typeof candidate.message_key === 'string' ? candidate.message_key : 'errors.requestFailed',
    retryable: candidate.retryable === true,
    correlation_id:
      typeof candidate.correlation_id === 'string'
        ? candidate.correlation_id
        : fallbackCorrelationId,
    field_errors:
      candidate.field_errors && typeof candidate.field_errors === 'object'
        ? (candidate.field_errors as Record<string, string[]>)
        : undefined,
  }
}
