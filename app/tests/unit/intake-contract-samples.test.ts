// 管理端的契约对着样例检查。样例是 info 后端的测试在测试库里造出各种状态之后，把管理接口的真实返回录下来的。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'
import type { z } from 'zod'

import {
  adminRequestsSchema,
  datasetsSchema,
  ingestionDetailSchema,
  ingestionsSchema,
  watchlistSchema,
} from '@/contracts/security-intake'
import {
  bytes,
  canRegister,
  decidedBySystem,
  earliest,
  handled,
  isCode,
  noteProblem,
  pendingFirstCome,
  registrationOf,
  wanting,
} from '@/features/intake/model/intake'

const dir = join(process.cwd(), 'preview/fixtures/full')
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as {
  responses: { method: string; path: string; query: string; status: number; file: string }[]
}
const read = (path: string, query = '') =>
  JSON.parse(
    readFileSync(
      join(dir, manifest.responses.find((r) => r.path === path && r.query === query)!.file),
      'utf8',
    ),
  )

const contracts: [RegExp, z.ZodType][] = [
  [/\/security-requests$/, adminRequestsSchema],
  [/\/security-watchlist$/, watchlistSchema],
  [/\/securities\/\d{6}\/ingestions$/, ingestionsSchema],
  [/\/securities\/\d{6}\/datasets$/, datasetsSchema],
  [/\/security-ingestions\/[0-9a-f-]{36}$/, ingestionDetailSchema],
]

describe('契约认得样例里的每一份返回', () => {
  it('一份不落', () => {
    let checked = 0
    for (const response of manifest.responses) {
      const contract = contracts.find(([pattern]) => pattern.test(response.path))
      expect(contract, response.path).toBeDefined()
      const parsed = contract![1].safeParse(
        JSON.parse(readFileSync(join(dir, response.file), 'utf8')),
      )
      expect(parsed.success ? null : `${response.path}: ${parsed.error.message}`).toBeNull()
      checked += 1
    }
    expect(checked).toBeGreaterThanOrEqual(12)
  })
})

describe('申请审批', () => {
  const all = adminRequestsSchema.parse(read('/api/admin/security-requests'))
  it('待批准的：只有还开着、没批的；最早申请的排最前', () => {
    const pending = pendingFirstCome(all)
    expect(pending.map((each) => each.status)).toEqual(['pending'])
    expect(pending[0].security_code).toBe('601012')
    // 两个人要这一家
    expect(wanting(pending[0])).toHaveLength(2)
    expect(earliest(pending[0]) <= pending[0].requesters[1].requested_at).toBe(true)
  })
  it('已处理的：别的都算', () => {
    expect(handled(all)).toHaveLength(all.length - 1)
    expect(handled(all).every((each) => each.status !== 'pending')).toBe(true)
  })
  it('撤回的人不算还要的人', () => {
    const withdrawn = all.find((each) => each.status === 'withdrawn')!
    expect(wanting(withdrawn)).toHaveLength(0)
  })
  it('拒绝必须写一句原因', () => {
    expect(noteProblem('  ')).toBe('required')
    expect(noteProblem('科创板的公司暂时不采')).toBeNull()
    expect(noteProblem('x'.repeat(2001))).toBe('too_long')
  })
  it('关注清单里的公司是系统批的', () => {
    expect(decidedBySystem({ ...all[0], decided_by: 'system:watchlist' })).toBe(true)
    expect(decidedBySystem(all[0])).toBe(false)
  })
})

describe('证券采集', () => {
  it('证券代码是六位数字', () => {
    expect(isCode('600585')).toBe(true)
    expect(isCode('60058')).toBe(false)
    expect(isCode('abc123')).toBe(false)
  })
  it('数据集交给 knowledge 了没有', () => {
    const published = datasetsSchema.parse(read('/api/admin/securities/002594/datasets'))[0]
    const failedQuality = datasetsSchema.parse(read('/api/admin/securities/600436/datasets'))[0]
    expect(registrationOf(published)).toBe('registered')
    expect(canRegister(published)).toBe(true)
    // 没过质量检查的不发布，也就不登记、不能重新登记
    expect(registrationOf(failedQuality)).toBe('not_published')
    expect(canRegister(failedQuality)).toBe(false)
    expect(
      registrationOf({
        ...published,
        knowledge_registered_at: null,
        knowledge_registration_error: 'knowledge_unavailable',
      }),
    ).toBe('failed')
    expect(registrationOf({ ...published, knowledge_registered_at: null })).toBe('waiting')
  })
  it('大小的写法', () => {
    expect(bytes(512)).toBe('512 B')
    expect(bytes(4096)).toBe('4.0 KB')
    expect(bytes(3 * 1024 * 1024)).toBe('3.0 MB')
  })
})
