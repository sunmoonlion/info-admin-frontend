// 申请审批、关注清单、证券采集的几条规则。纯函数。
import type { AdminRequest, Dataset, Requester } from '@/contracts/security-intake'

export function isCode(text: string): boolean {
  return /^\d{6}$/.test(text.trim())
}

// 还要的人：撤回的不算
export function wanting(request: AdminRequest): Requester[] {
  return request.requesters.filter((each) => each.withdrawn_at === null)
}

// 最早是什么时候申请的
export function earliest(request: AdminRequest): string {
  return request.requesters.reduce(
    (first, each) => (each.requested_at < first ? each.requested_at : first),
    request.created_at,
  )
}

// 待批准的：最早申请的排最前
export function pendingFirstCome(requests: readonly AdminRequest[]): AdminRequest[] {
  return requests
    .filter((each) => each.status === 'pending' && each.open)
    .sort((a, b) => earliest(a).localeCompare(earliest(b)))
}

// 已处理的：不是待批准的都算。最近处理的排最前
export function handled(requests: readonly AdminRequest[]): AdminRequest[] {
  return requests
    .filter((each) => each.status !== 'pending')
    .sort((a, b) =>
      (b.decided_at ?? b.closed_at ?? b.created_at).localeCompare(
        a.decided_at ?? a.closed_at ?? a.created_at,
      ),
    )
}

// 拒绝必须写一句原因
export function noteProblem(note: string): 'required' | 'too_long' | null {
  const text = note.trim()
  if (text.length === 0) return 'required'
  if (text.length > 2000) return 'too_long'
  return null
}

// 批准人是系统（关注清单里的公司自动批准）还是人
export function decidedBySystem(request: AdminRequest): boolean {
  return (request.decided_by ?? '').startsWith('system')
}

// 数据集交给 knowledge 了没有
export type Registration = 'registered' | 'failed' | 'waiting' | 'not_published'

export function registrationOf(dataset: Dataset): Registration {
  if (dataset.status !== 'published') return 'not_published' // 没过质量检查的不发布，也不登记
  if (dataset.knowledge_registered_at) return 'registered'
  return dataset.knowledge_registration_error ? 'failed' : 'waiting'
}

// 能不能重新登记：只有发布了的版本
export function canRegister(dataset: Dataset): boolean {
  return dataset.status === 'published'
}

export function bytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
