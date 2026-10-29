// 来源目录几页的状态与算法：不取数、不渲染。

import type { Channel, Trial } from '@/contracts/supply'

// 排先后：把一条往前或往后挪一位，回整份新顺序（切合时按这个顺序试渠道）
export function moved(ids: readonly string[], id: string, delta: -1 | 1): string[] {
  const order = [...ids]
  const from = order.indexOf(id)
  const to = from + delta
  if (from < 0 || to < 0 || to >= order.length) return order
  ;[order[from], order[to]] = [order[to], order[from]]
  return order
}

// 逗号、空白、顿号分开的一串（类型）
export function splitList(text: string): string[] {
  return [...new Set(text.split(/[\s,，、]+/).filter(Boolean))]
}

// 放行要最近一次试采成功（后端还会核它比最近一次改登记新）
export function latestTrialOk(trials: readonly Trial[]): boolean {
  return trials[0]?.status === 'ok'
}

export function trialRunning(trials: readonly Trial[]): boolean {
  return trials.some((t) => t.status === 'queued' || t.status === 'running')
}

// 渠道上能做的启停：在用的能暂停、停用；暂停的能恢复、停用；停用的（审过才）能启用
export function statusActions(channel: Pick<Channel, 'status' | 'review'>) {
  if (channel.status === 'active') return ['pause', 'disable'] as const
  if (channel.status === 'paused') return ['resume', 'disable'] as const
  return channel.review === 'approved' ? (['enable'] as const) : ([] as const)
}

// 等了几小时（待审网站、队列里最早那个）
export function hoursSince(at: string | null, now: Date): number | null {
  if (!at) return null
  return Math.max(0, Math.floor((now.getTime() - new Date(at).getTime()) / 3_600_000))
}

// 接口拒绝时带的错误码（统一错误形状里的 code）；认不出就是 null
export function codeOf(error: unknown): string | null {
  if (error && typeof error === 'object' && 'problem' in error) {
    const problem = (error as { problem?: { code?: unknown } }).problem
    if (problem && typeof problem.code === 'string') return problem.code
  }
  return null
}
