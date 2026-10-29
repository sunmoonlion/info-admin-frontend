import { describe, expect, it } from 'vitest'

import {
  codeOf,
  hoursSince,
  latestTrialOk,
  moved,
  splitList,
  statusActions,
  trialRunning,
} from '@/features/supply/model/supply'
import type { Trial } from '@/contracts/supply'

const trial = (status: Trial['status']): Trial => ({
  trial_id: status,
  key: {},
  status,
  requested_by: 'op',
  created_at: '2026-10-29T08:00:00Z',
  finished_at: null,
  listed: [],
  fetched: null,
  error: null,
})

describe('来源目录的算法', () => {
  it('排先后：挪一位，到头了不动', () => {
    expect(moved(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c'])
    expect(moved(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b'])
    expect(moved(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c'])
    expect(moved(['a', 'b'], 'x', 1)).toEqual(['a', 'b'])
  })

  it('类型按逗号、顿号、空白分开，去重', () => {
    expect(splitList('annual_report，q1_report、 annual_report  q3_report')).toEqual([
      'annual_report',
      'q1_report',
      'q3_report',
    ])
  })

  it('放行看最近一次试采；排着、在跑的要等', () => {
    expect(latestTrialOk([trial('ok'), trial('failed')])).toBe(true)
    expect(latestTrialOk([trial('failed'), trial('ok')])).toBe(false)
    expect(latestTrialOk([])).toBe(false)
    expect(trialRunning([trial('queued')])).toBe(true)
    expect(trialRunning([trial('ok')])).toBe(false)
  })

  it('启停：在用能暂停、停用；暂停能恢复、停用；停用的审过才能启用', () => {
    expect(statusActions({ status: 'active', review: 'approved' })).toEqual(['pause', 'disable'])
    expect(statusActions({ status: 'paused', review: 'approved' })).toEqual(['resume', 'disable'])
    expect(statusActions({ status: 'disabled', review: 'approved' })).toEqual(['enable'])
    expect(statusActions({ status: 'disabled', review: 'rejected' })).toEqual([])
  })

  it('等了几小时；错误码从统一错误形状里取', () => {
    expect(hoursSince('2026-10-29T00:00:00Z', new Date('2026-10-29T05:30:00Z'))).toBe(5)
    expect(hoursSince(null, new Date())).toBeNull()
    expect(codeOf({ problem: { code: 'trial_required' } })).toBe('trial_required')
    expect(codeOf(new Error('x'))).toBeNull()
  })
})
