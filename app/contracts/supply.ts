// 管理端供给接口的契约（SDD 0045 第 3.1 节、第四节）。字段以 knowfeed-backend
// `app/interfaces/http/admin/supply.py` 为真源。
import { z } from 'zod'

const when = z.string()

export const channelSchema = z
  .object({
    channel_id: z.string(),
    name: z.string(),
    kind: z.string(),
    plugin: z.string(),
    doc_types: z.array(z.string()),
    readings: z.array(z.string()),
    license: z.string(),
    // 审核结论：待审、放行、审不过；状态：在用、暂停、停用
    review: z.enum(['pending', 'approved', 'rejected']),
    status: z.enum(['active', 'paused', 'disabled']),
    status_reason: z.string().nullable(),
    priority: z.number().int(),
    rate_per_minute: z.number().int(),
    daily_cap: z.number().int(),
    consecutive_failures: z.number().int(),
    domain: z.string().nullable(),
    terms_url: z.string().nullable(),
    render_allowed: z.boolean(),
    obey_robots: z.boolean(),
    config: z.record(z.string(), z.unknown()),
    created_at: when.nullable(),
    updated_at: when.nullable(),
  })
  .loose()
export type Channel = z.infer<typeof channelSchema>

export const channelListSchema = z
  .object({
    items: z.array(channelSchema),
    plugins: z.array(z.object({ name: z.string(), kind: z.string() }).loose()),
    auto_pause_after: z.number().int(),
  })
  .loose()
export type ChannelList = z.infer<typeof channelListSchema>

export const eventSchema = z
  .object({
    action: z.string(),
    actor: z.string(),
    reason: z.string().nullable(),
    detail: z.record(z.string(), z.unknown()),
    at: when,
  })
  .loose()
export type ChannelEvent = z.infer<typeof eventSchema>

export const trialSchema = z
  .object({
    trial_id: z.string(),
    key: z.record(z.string(), z.unknown()),
    status: z.enum(['queued', 'running', 'ok', 'failed']),
    requested_by: z.string(),
    created_at: when,
    finished_at: when.nullable(),
    listed: z.array(z.record(z.string(), z.unknown())),
    fetched: z.record(z.string(), z.unknown()).nullable(),
    error: z.string().nullable(),
  })
  .loose()
export type Trial = z.infer<typeof trialSchema>

export const channelDetailSchema = z
  .object({ channel: channelSchema, events: z.array(eventSchema), trials: z.array(trialSchema) })
  .loose()
export type ChannelDetail = z.infer<typeof channelDetailSchema>

export const sitesSchema = z
  .object({
    pending: z.number().int(),
    oldest_since: when.nullable(),
    alerts: z.array(z.string()),
    review_within_days: z.number().int(),
    alert_count: z.number().int(),
    alert_wait_hours: z.number().int(),
    items: z.array(
      z
        .object({
          channel_id: z.string(),
          domain: z.string().nullable(),
          since: when.nullable(),
          waiting_items: z.number().int(),
          users: z.number().int(),
          oldest_item_at: when.nullable(),
        })
        .loose(),
    ),
  })
  .loose()
export type Sites = z.infer<typeof sitesSchema>

export const gapsSchema = z
  .object({
    items: z.array(
      z
        .object({
          // uncovered：这类数据还取不到；absent：渠道里没有这一份；site：网站审不过或没人审
          kind: z.enum(['uncovered', 'absent', 'site']),
          doc_type: z.string().nullable(),
          items: z.number().int(),
          users: z.number().int(),
          subjects: z.number().int(),
          sample_subjects: z.array(z.string()),
          first_at: when,
          last_at: when,
        })
        .loose(),
    ),
  })
  .loose()
export type Gap = z.infer<typeof gapsSchema>['items'][number]

export const queueSchema = z
  .object({
    since: when,
    channels: z.array(
      z
        .object({
          channel_id: z.string(),
          name: z.string(),
          status: z.string(),
          status_reason: z.string().nullable(),
          consecutive_failures: z.number().int(),
          queued: z.number().int(),
          running: z.number().int(),
          waiting: z.number().int(),
          failed_recent: z.number().int(),
          done_recent: z.number().int(),
          oldest_open_at: when.nullable(),
        })
        .loose(),
    ),
    tiers: z.array(z.object({ tier: z.number().int(), open: z.number().int() }).loose()),
    failures: z.array(
      z.object({ channel_id: z.string(), reason: z.string(), count: z.number().int() }).loose(),
    ),
  })
  .loose()
export type Queue = z.infer<typeof queueSchema>

export const jobSchema = z
  .object({
    job_id: z.string(),
    kind: z.string(),
    channel_id: z.string(),
    key: z.record(z.string(), z.unknown()),
    status: z.string(),
    tier: z.number().int(),
    attempts: z.number().int(),
    last_error: z.string().nullable(),
    created_at: when,
    finished_at: when.nullable(),
    waiting_items: z.number().int(),
  })
  .loose()
export type Job = z.infer<typeof jobSchema>

export const jobsSchema = z.object({ items: z.array(jobSchema) }).loose()

export const jobDetailSchema = jobSchema
  .extend({
    channel_status: z.string(),
    attempt_list: z.array(
      z
        .object({
          started_at: when,
          finished_at: when.nullable(),
          outcome: z.string().nullable(),
          reason: z.string().nullable(),
        })
        .loose(),
    ),
  })
  .loose()
export type JobDetail = z.infer<typeof jobDetailSchema>

// 登记一条渠道写什么（0045 第 3.1 节）
export type RegistrationInput = {
  name: string
  kind: 'catalog' | 'feed' | 'web' | 'search'
  plugin: string
  doc_types: string[]
  readings: ('original' | 'text' | 'pages' | 'table')[]
  license: 'self' | 'via_expert' | 'sale'
  rate_per_minute: number
  daily_cap: number
  domain?: string | null
  terms_url?: string | null
  render_allowed: boolean
  obey_robots: boolean
}

export type TrialInput = {
  subject: string
  doc_type: string
  period_start?: string
  period_end?: string
}
