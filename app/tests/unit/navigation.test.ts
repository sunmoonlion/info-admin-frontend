import { describe, expect, it } from 'vitest'
import { filterNavigationByRoles, findNavigationItem } from '@/lib/navigation'

describe('admin navigation', () => {
  it('uses the same metadata for role filtering and locale-aware route matching', () => {
    expect(filterNavigationByRoles([]).map((item) => item.key)).toEqual(['dashboard', 'settings'])
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).toContain('reference')
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).not.toContain(
      'rich-reference',
    )
    expect(filterNavigationByRoles(['admin']).map((item) => item.key)).toContain('rich-reference')
    expect(findNavigationItem('/zh-CN/reference/details')?.key).toBe('reference')
    // 旧通用采集与旧证券专线已退（SDD 0045 第六节）
    expect(findNavigationItem('/zh-CN/knowfeed/crawl')).toBeUndefined()
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).not.toContain(
      'knowfeed-crawl',
    )
    expect(findNavigationItem('/zh-CN/knowfeed/requests')).toBeUndefined()
    // 来源目录、待审网站、缺口清单、队列监控（SDD 0045 第一节）：平台人员都能看
    expect(filterNavigationByRoles(['operator']).map((item) => item.key)).toEqual(
      expect.arrayContaining(['supply-channels', 'supply-sites', 'supply-gaps', 'supply-queue']),
    )
    expect(filterNavigationByRoles([]).map((item) => item.key)).not.toContain('supply-channels')
    expect(findNavigationItem('/zh-CN/knowfeed/gaps')?.key).toBe('supply-gaps')
    expect(findNavigationItem('/en/knowfeed/channels')?.key).toBe('supply-channels')
  })
})
