'use client'

// 来源目录、待审网站、缺口清单、队列监控的取数与改动（knowfeed-backend `admin/supply.py`）。
// 答复一律过 zod；改动带管理端会话的 CSRF 令牌。
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'

import {
  channelDetailSchema,
  channelListSchema,
  channelSchema,
  gapsSchema,
  jobDetailSchema,
  jobsSchema,
  queueSchema,
  sitesSchema,
  trialSchema,
  type RegistrationInput,
  type TrialInput,
} from '@/contracts/supply'
import { requestJson } from '@/lib/api/client'

const BASE = '/api/admin/v1/supply'
const seg = (value: string) => encodeURIComponent(value)

export class SupplyContractError extends Error {
  constructor() {
    super('supply_contract_invalid')
    this.name = 'SupplyContractError'
  }
}

async function read<T>(
  schema: z.ZodType<T>,
  path: string,
  init?: Parameters<typeof requestJson>[1],
) {
  const parsed = schema.safeParse(await requestJson<unknown>(path, init))
  if (!parsed.success) throw new SupplyContractError()
  return parsed.data
}

const keys = {
  channels: ['supply', 'channels'] as const,
  channel: (id: string) => ['supply', 'channel', id] as const,
  sites: ['supply', 'sites'] as const,
  gaps: (kind: string) => ['supply', 'gaps', kind] as const,
  queue: ['supply', 'queue'] as const,
  jobs: (status: string) => ['supply', 'jobs', status] as const,
  job: (id: string) => ['supply', 'job', id] as const,
}

export function useChannels() {
  return useQuery({
    queryKey: keys.channels,
    queryFn: () => read(channelListSchema, `${BASE}/channels`),
  })
}

// 试采在 worker 里跑：排着或在跑时每 3 秒看一次
export function useChannel(id: string | null) {
  return useQuery({
    queryKey: keys.channel(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => read(channelDetailSchema, `${BASE}/channels/${seg(id ?? '')}`),
    refetchInterval: (query) =>
      query.state.data?.trials.some((t) => t.status === 'queued' || t.status === 'running')
        ? 3000
        : false,
  })
}

export function useSites() {
  return useQuery({ queryKey: keys.sites, queryFn: () => read(sitesSchema, `${BASE}/sites`) })
}

export function useGaps(kind: string) {
  const query = kind ? `?kind=${seg(kind)}` : ''
  return useQuery({
    queryKey: keys.gaps(kind),
    queryFn: async () => (await read(gapsSchema, `${BASE}/gaps${query}`)).items,
  })
}

export function useQueue() {
  return useQuery({
    queryKey: keys.queue,
    queryFn: () => read(queueSchema, `${BASE}/queue`),
    refetchInterval: 15000,
  })
}

export function useJobs(status: string) {
  const query = status ? `?status=${seg(status)}` : ''
  return useQuery({
    queryKey: keys.jobs(status),
    queryFn: async () => (await read(jobsSchema, `${BASE}/jobs${query}`)).items,
  })
}

export function useJob(id: string | null) {
  return useQuery({
    queryKey: keys.job(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => read(jobDetailSchema, `${BASE}/jobs/${seg(id ?? '')}`),
  })
}

// 改动之后把供给的几页都刷新：渠道的状态、待审网站、队列互相牵连
function useSupplyMutation<TInput, TResult>(send: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: send,
    onSuccess: () => client.invalidateQueries({ queryKey: ['supply'] }),
  })
}

export function useRegister(csrfToken: string) {
  return useSupplyMutation((input: RegistrationInput & { channel_id: string }) =>
    read(channelSchema, `${BASE}/channels`, { method: 'POST', body: input, csrfToken }),
  )
}

export function useUpdate(csrfToken: string) {
  return useSupplyMutation(({ id, ...input }: RegistrationInput & { id: string; reason: string }) =>
    read(channelSchema, `${BASE}/channels/${seg(id)}`, { method: 'PUT', body: input, csrfToken }),
  )
}

export function useReview(csrfToken: string) {
  return useSupplyMutation(
    ({
      id,
      ...body
    }: {
      id: string
      decision: 'approve' | 'reject'
      reason: string
      license?: 'self' | 'via_expert' | 'sale'
      zone?: 'disclosure' | 'collected'
    }) =>
      read(channelSchema, `${BASE}/channels/${seg(id)}/review`, {
        method: 'POST',
        body,
        csrfToken,
      }),
  )
}

export function useStatus(csrfToken: string) {
  return useSupplyMutation(
    ({
      id,
      ...body
    }: {
      id: string
      action: 'pause' | 'resume' | 'disable' | 'enable'
      reason?: string
    }) =>
      read(channelSchema, `${BASE}/channels/${seg(id)}/status`, {
        method: 'POST',
        body,
        csrfToken,
      }),
  )
}

export function useReorder(csrfToken: string) {
  return useSupplyMutation((channel_ids: string[]) =>
    read(channelListSchema, `${BASE}/channels/order`, {
      method: 'POST',
      body: { channel_ids },
      csrfToken,
    }),
  )
}

export function useTrial(csrfToken: string) {
  return useSupplyMutation(({ id, ...body }: TrialInput & { id: string }) =>
    read(trialSchema, `${BASE}/channels/${seg(id)}/trials`, { method: 'POST', body, csrfToken }),
  )
}

export function useRequeue(csrfToken: string) {
  return useSupplyMutation((id: string) =>
    read(jobDetailSchema, `${BASE}/jobs/${seg(id)}/requeue`, { method: 'POST', csrfToken }),
  )
}
