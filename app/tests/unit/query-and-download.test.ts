import { describe, expect, it } from 'vitest'
import { assertSameOriginDownloadPath } from '@/lib/download'
import { normalizePageQuery, pageQueryKey } from '@/lib/query'
import { formatBytes, safeMediaPath } from '@/lib/rich-utils'

describe('common data adapters', () => {
  it('normalizes pagination and creates scope-stable query keys', () => {
    const query = normalizePageQuery({
      page: -2,
      pageSize: 500,
      search: '  governance  ',
      direction: 'desc',
    })
    expect(query).toEqual({
      page: 1,
      pageSize: 200,
      search: 'governance',
      sort: undefined,
      direction: 'desc',
    })
    expect(pageQueryKey('policies', 'tenant-a', query)).toEqual([
      'admin',
      'policies',
      'tenant-a',
      query,
    ])
  })

  it.each(['https://evil.example/file', '//evil.example/file', String.raw`\api\file`])(
    'rejects unsafe download paths: %s',
    (path) => expect(() => assertSameOriginDownloadPath(path)).toThrow(),
  )

  it('keeps media same-origin and formats safe byte values', () => {
    expect(safeMediaPath('/media/file.mp3')).toBe('/media/file.mp3')
    expect(() => safeMediaPath('https://evil.example/file.mp3')).toThrow()
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(-1)).toBe('—')
  })
})
