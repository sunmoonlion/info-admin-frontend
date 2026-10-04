'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  adminRequestSchema,
  adminRequestsSchema,
  datasetSchema,
  datasetsSchema,
  ingestionDetailSchema,
  ingestionSchema,
  ingestionsSchema,
  watchlistSchema,
} from '@/contracts/security-intake'

import { getJson, postJson, seg } from './http'

const base = '/api/admin'

// ---------------- 申请 ----------------
export function useOpenRequests() {
  return useQuery({
    queryKey: ['intake', 'requests', 'open'],
    queryFn: () => getJson(adminRequestsSchema, `${base}/security-requests?open=true`),
  })
}

// 已处理的。status 给了就按它筛
export function useHandledRequests(status: string) {
  return useQuery({
    queryKey: ['intake', 'requests', 'handled', status],
    queryFn: () =>
      getJson(
        adminRequestsSchema,
        `${base}/security-requests${status ? `?status=${seg(status)}` : ''}`,
      ),
  })
}

export function useRequestDecisions(csrfToken: string) {
  const client = useQueryClient()
  const changed = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ['intake', 'requests'] }),
      client.invalidateQueries({ queryKey: ['intake', 'watchlist'] }),
    ])
  return {
    approve: useMutation({
      mutationFn: (input: { id: string; addToWatchlist: boolean }) =>
        postJson(
          adminRequestSchema,
          `${base}/security-requests/${seg(input.id)}/approval`,
          csrfToken,
          {
            add_to_watchlist: input.addToWatchlist,
          },
        ),
      onSuccess: changed,
    }),
    // 拒绝必须写一句原因：用户看得到原因，看不到是谁拒绝的
    reject: useMutation({
      mutationFn: (input: { id: string; note: string }) =>
        postJson(
          adminRequestSchema,
          `${base}/security-requests/${seg(input.id)}/rejection`,
          csrfToken,
          {
            note: input.note,
          },
        ),
      onSuccess: changed,
    }),
  }
}

// ---------------- 关注清单 ----------------
export function useWatchlist(includeRemoved: boolean) {
  return useQuery({
    queryKey: ['intake', 'watchlist', includeRemoved],
    queryFn: () =>
      getJson(
        watchlistSchema,
        `${base}/security-watchlist${includeRemoved ? '?include_removed=true' : ''}`,
      ),
  })
}

export function useWatchActions(csrfToken: string) {
  const client = useQueryClient()
  const changed = () => client.invalidateQueries({ queryKey: ['intake'] })
  return {
    add: useMutation({
      mutationFn: (input: { code: string; note: string }) =>
        postJson(watchlistSchema, `${base}/security-watchlist`, csrfToken, {
          security_code: input.code,
          ...(input.note.trim() ? { note: input.note.trim() } : {}),
        }),
      onSuccess: changed,
    }),
    remove: useMutation({
      mutationFn: (input: { code: string; note: string }) =>
        postJson(
          watchlistSchema,
          `${base}/security-watchlist/${seg(input.code)}/removal`,
          csrfToken,
          {
            ...(input.note.trim() ? { note: input.note.trim() } : {}),
          },
        ),
      onSuccess: changed,
    }),
  }
}

// ---------------- 证券采集 ----------------
export function useIngestions(code: string) {
  return useQuery({
    queryKey: ['intake', 'ingestions', code],
    queryFn: () => getJson(ingestionsSchema, `${base}/securities/${seg(code)}/ingestions`),
    enabled: code !== '',
  })
}

export function useIngestion(id: string | null) {
  return useQuery({
    queryKey: ['intake', 'ingestion', id],
    queryFn: () => getJson(ingestionDetailSchema, `${base}/security-ingestions/${seg(id!)}`),
    enabled: id !== null,
  })
}

export function useDatasets(code: string) {
  return useQuery({
    queryKey: ['intake', 'datasets', code],
    queryFn: () => getJson(datasetsSchema, `${base}/securities/${seg(code)}/datasets`),
    enabled: code !== '',
  })
}

export function useSecurityActions(csrfToken: string) {
  const client = useQueryClient()
  const changed = () => client.invalidateQueries({ queryKey: ['intake'] })
  return {
    // 所有者直接发起：不产生申请，不占任何人的名额
    start: useMutation({
      mutationFn: (code: string) =>
        postJson(ingestionSchema, `${base}/securities/${seg(code)}/ingestions`, csrfToken),
      onSuccess: changed,
    }),
    // 向 knowledge 重新登记某个版本
    register: useMutation({
      mutationFn: (record: string) =>
        postJson(datasetSchema, `${base}/security-datasets/${seg(record)}/registration`, csrfToken),
      onSuccess: changed,
    }),
  }
}
