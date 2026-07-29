export type PageQuery = {
  page: number
  pageSize: number
  search: string
  sort?: string
  direction?: 'asc' | 'desc'
}

export function normalizePageQuery(input: Partial<PageQuery>): PageQuery {
  return {
    page: clampInteger(input.page, 1, 10_000, 1),
    pageSize: clampInteger(input.pageSize, 1, 200, 20),
    search: (input.search ?? '').trim().slice(0, 256),
    sort: input.sort?.trim().slice(0, 64) || undefined,
    direction: input.direction === 'desc' ? 'desc' : input.direction === 'asc' ? 'asc' : undefined,
  }
}

export function pageQueryKey(resource: string, scope: string, query: PageQuery) {
  const normalized = normalizePageQuery(query)
  return ['admin', resource, scope, normalized] as const
}

function clampInteger(value: number | undefined, min: number, max: number, fallback: number) {
  return Number.isInteger(value) ? Math.min(max, Math.max(min, value as number)) : fallback
}
