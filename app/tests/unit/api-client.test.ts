import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClientError, requestJson } from '@/lib/api/client'

describe('same-origin admin API client', () => {
  afterEach(() => vi.restoreAllMocks())

  it('adds correlation and CSRF only to an unsafe same-origin request', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ ok: true }))
    await requestJson('/api/resources', {
      method: 'POST',
      csrfToken: 'csrf-token',
      body: { name: 'Policy' },
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/resources',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'manual',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'csrf-token',
          'X-Correlation-ID': expect.any(String),
        }),
      }),
    )
  })

  it('normalizes structured backend errors without exposing response text', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json(
        {
          code: 'forbidden',
          message_key: 'errors.forbidden',
          retryable: false,
          correlation_id: 'backend-correlation',
        },
        { status: 403 },
      ),
    )
    await expect(requestJson('/api/resources')).rejects.toMatchObject({
      status: 403,
      problem: {
        code: 'forbidden',
        message_key: 'errors.forbidden',
        correlation_id: 'backend-correlation',
        retryable: false,
      },
    } satisfies Partial<ApiClientError>)
  })

  it.each(['https://evil.example/api', '//evil.example/api', '/resources'])(
    'rejects a non-contract API path: %s',
    async (path) => {
      await expect(requestJson(path)).rejects.toThrow(/same-origin/)
    },
  )
})
