// 采集申请、关注清单、证券采集的契约（管理面）。字段以 info-backend 的接口为真源。
// 由 `tests/unit/intake-contract-samples.test.ts` 对着真后端录下来的返回逐份检查。
import { z } from 'zod'

const uuid = z.uuid()

const datasetRefSchema = z
  .object({
    dataset_id: z.string(),
    data_version: z.string(),
    start_date: z.string(),
    end_date: z.string(),
  })
  .loose()

const requesterSchema = z
  .object({
    actor_id: uuid,
    reason: z.string().nullable(),
    origin: z.object({ app: z.string(), ref: z.string().nullable() }).loose().nullable(),
    requested_at: z.string(),
    withdrawn_at: z.string().nullable(),
  })
  .loose()
export type Requester = z.infer<typeof requesterSchema>

export const adminRequestSchema = z
  .object({
    id: uuid,
    security_code: z.string(),
    kind: z.string(),
    status: z.enum(['pending', 'approved', 'rejected', 'withdrawn']),
    progress: z.string(),
    open: z.boolean(),
    created_at: z.string(),
    closed_at: z.string().nullable(),
    decided_by: z.string().nullable(),
    decided_at: z.string().nullable(),
    decision_note: z.string().nullable(),
    ingestion_id: uuid.nullable(),
    in_watchlist: z.boolean(),
    requesters: z.array(requesterSchema),
    dataset: datasetRefSchema.nullable(),
  })
  .loose()
export type AdminRequest = z.infer<typeof adminRequestSchema>
export const adminRequestsSchema = z.array(adminRequestSchema)

export const watchEntrySchema = z
  .object({
    security_code: z.string(),
    added_at: z.string(),
    added_by: z.string(),
    note: z.string().nullable(),
    removed_at: z.string().nullable(),
    removed_by: z.string().nullable(),
    removal_note: z.string().nullable(),
  })
  .loose()
export type WatchEntry = z.infer<typeof watchEntrySchema>
export const watchlistSchema = z.array(watchEntrySchema)

export const ingestionSchema = z
  .object({
    id: uuid,
    security_code: z.string(),
    market: z.string(),
    status: z.string(),
    sources: z.array(z.string()),
    requested_at: z.string(),
    started_at: z.string().nullable(),
    finished_at: z.string().nullable(),
    summary: z.record(z.string(), z.unknown()),
    error_code: z.string().nullable(),
    error_detail: z.string().nullable(),
  })
  .loose()
export type Ingestion = z.infer<typeof ingestionSchema>
export const ingestionsSchema = z.array(ingestionSchema)

export const ingestionDetailSchema = ingestionSchema
  .extend({
    items: z.array(
      z
        .object({
          seq: z.number().int(),
          source_code: z.string(),
          kind: z.string(),
          size_bytes: z.number().int(),
          reused: z.boolean(),
          http_status: z.number().int(),
        })
        .loose(),
    ),
  })
  .loose()
export type IngestionDetail = z.infer<typeof ingestionDetailSchema>

export const datasetSchema = z
  .object({
    id: uuid,
    security_code: z.string(),
    dataset_id: z.string(),
    data_version: z.string(),
    status: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    built_at: z.string(),
    failed_checks: z.array(z.string()),
    knowledge_registered_at: z.string().nullable(),
    knowledge_registration_error: z.string().nullable(),
  })
  .loose()
export type Dataset = z.infer<typeof datasetSchema>
export const datasetsSchema = z.array(datasetSchema)
