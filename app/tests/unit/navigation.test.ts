import { describe, expect, it } from 'vitest'
import { filterNavigationByRoles, findNavigationItem } from '@/lib/navigation'

describe('admin navigation', () => {
  it('uses the same metadata for role filtering and locale-aware route matching', () => {
    expect(filterNavigationByRoles([]).map((item) => item.key)).toEqual(['dashboard', 'settings'])
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).toContain('reference')
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).toContain(
      'knowfeed-crawl',
    )
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).not.toContain(
      'rich-reference',
    )
    expect(filterNavigationByRoles(['admin']).map((item) => item.key)).toContain('rich-reference')
    expect(findNavigationItem('/zh-CN/reference/details')?.key).toBe('reference')
    expect(findNavigationItem('/zh-CN/knowfeed/crawl')?.key).toBe('knowfeed-crawl')
    // 旧证券专线的三页（申请审批、证券采集、关注清单）已退（SDD 0045 第六节第 2 条）
    expect(findNavigationItem('/zh-CN/knowfeed/requests')).toBeUndefined()
  })
})
