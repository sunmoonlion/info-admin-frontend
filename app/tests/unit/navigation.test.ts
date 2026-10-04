import { describe, expect, it } from 'vitest'
import { filterNavigationByRoles, findNavigationItem } from '@/lib/navigation'

describe('admin navigation', () => {
  it('uses the same metadata for role filtering and locale-aware route matching', () => {
    expect(filterNavigationByRoles([]).map((item) => item.key)).toEqual(['dashboard', 'settings'])
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).toContain('reference')
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).toContain('info-crawl')
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).not.toContain(
      'rich-reference',
    )
    expect(filterNavigationByRoles(['admin']).map((item) => item.key)).toContain('rich-reference')
    expect(findNavigationItem('/zh-CN/reference/details')?.key).toBe('reference')
    // 数据入库的三页只给 info 管理员
    const intake = ['info-requests', 'info-securities', 'info-watchlist']
    expect(filterNavigationByRoles(['admin']).map((item) => item.key)).toEqual(
      expect.arrayContaining(intake),
    )
    for (const key of intake) {
      expect(filterNavigationByRoles(['operator']).map((item) => item.key)).not.toContain(key)
    }
    expect(findNavigationItem('/zh-CN/info/requests')?.key).toBe('info-requests')
  })
})
