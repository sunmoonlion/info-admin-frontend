// 管理接口的收发。同源 /api/admin；改动类的请求带 CSRF；答复一律过 zod。
import { z } from 'zod'

export class IntakeError extends Error {
  constructor(
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(code)
    this.name = 'IntakeError'
  }
}

// 出错时后端给 { detail: { code, message } }，或者 { detail: "一个词" }
function codeOf(payload: unknown): string {
  const detail = (payload as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (
    detail &&
    typeof detail === 'object' &&
    typeof (detail as { code?: unknown }).code === 'string'
  ) {
    return (detail as { code: string }).code
  }
  return 'request_failed'
}

async function exchange<T>(schema: z.ZodType<T>, path: string, init: RequestInit): Promise<T> {
  if (!path.startsWith('/api/admin/')) throw new Error('admin path expected')
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'manual',
      headers: { Accept: 'application/json', ...init.headers },
    })
  } catch {
    throw new IntakeError('backend_unavailable')
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok || response.type === 'opaqueredirect') {
    throw new IntakeError(codeOf(payload), response.status)
  }
  const parsed = schema.safeParse(payload)
  if (!parsed.success) throw new IntakeError('contract_invalid', response.status)
  return parsed.data
}

export function getJson<T>(schema: z.ZodType<T>, path: string) {
  return exchange(schema, path, { method: 'GET' })
}

export function postJson<T>(schema: z.ZodType<T>, path: string, csrfToken: string, body?: unknown) {
  return exchange(schema, path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(body ?? {}),
  })
}

export const seg = (value: string) => encodeURIComponent(value)
