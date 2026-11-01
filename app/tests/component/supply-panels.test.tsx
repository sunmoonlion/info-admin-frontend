import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChannelsPanel, GapsPanel, QueuePanel, SitesPanel } from '@/features/supply'
import { channelSchema } from '@/contracts/supply'
import { RegistrationForm } from '@/features/supply/ui/registration-form'
import messages from '@/messages/zh-CN.json'

// 后端答复的样子（knowfeed-backend `app/interfaces/http/admin/supply.py`）
const cninfo = {
  channel_id: 'cninfo',
  name: '巨潮资讯网（法定信息披露）',
  kind: 'catalog',
  plugin: 'cninfo',
  doc_types: ['annual_report'],
  readings: ['original', 'pages', 'table'],
  license: 'via_expert',
  zone: 'disclosure',
  review: 'approved',
  status: 'active',
  status_reason: null,
  priority: 10,
  rate_per_minute: 20,
  daily_cap: 3000,
  max_running: 1,
  consecutive_failures: 0,
  domain: 'cninfo.com.cn',
  terms_url: null,
  render_allowed: false,
  obey_robots: true,
  config: {},
  created_at: '2026-10-27T00:00:00Z',
  updated_at: '2026-10-27T00:00:00Z',
}
const sse = {
  ...cninfo,
  channel_id: 'sse',
  name: '上交所定期报告',
  review: 'pending',
  priority: 20,
  domain: 'sse.com.cn',
}
const list = {
  items: [cninfo, sse],
  plugins: [
    { name: 'cninfo', kind: 'catalog' },
    { name: 'web', kind: 'web' },
  ],
  auto_pause_after: 5,
}

type Call = { url: string; method: string; body: unknown; csrf: string | null }
let calls: Call[] = []

function serve(routes: Record<string, (call: Call) => Response>) {
  calls = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init: RequestInit = {}) => {
      const headers = (init.headers ?? {}) as Record<string, string>
      const call = {
        url: String(input),
        method: init.method ?? 'GET',
        body: init.body ? JSON.parse(String(init.body)) : undefined,
        csrf: headers['X-CSRF-Token'] ?? null,
      }
      calls.push(call)
      const route = routes[`${call.method} ${call.url}`]
      return route ? route(call) : new Response('{}', { status: 404 })
    }),
  )
}
afterEach(() => vi.unstubAllGlobals())

function show(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <NextIntlClientProvider
      locale="zh-CN"
      messages={messages}
      timeZone="Asia/Shanghai"
      now={new Date('2026-10-29T12:00:00Z')}
    >
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('来源目录', () => {
  it('按先后列渠道，挪一位就把整份新顺序交给后端', async () => {
    serve({
      'GET /api/admin/v1/supply/channels': () => Response.json(list),
      'POST /api/admin/v1/supply/channels/order': () =>
        Response.json({ ...list, items: [sse, cninfo] }),
    })
    show(<ChannelsPanel csrfToken="csrf-token-0123456789-0123456789-abcd" />)
    const table = await screen.findByRole('table', { name: '来源目录' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('已放行')).toBeInTheDocument()
    expect(within(rows[1]).getByText('待审')).toBeInTheDocument()
    expect(within(rows[0]).getByText('可以经专家给别人用')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '把 上交所定期报告 往前挪' }))
    await vi.waitFor(() =>
      expect(calls.find((c) => c.method === 'POST')).toMatchObject({
        url: '/api/admin/v1/supply/channels/order',
        body: { channel_ids: ['sse', 'cninfo'] },
        csrf: 'csrf-token-0123456789-0123456789-abcd',
      }),
    )
  })

  it('打开一条：没试采成功不能放行；后端拒绝时说人话', async () => {
    serve({
      'GET /api/admin/v1/supply/channels': () => Response.json(list),
      'GET /api/admin/v1/supply/channels/sse': () =>
        Response.json({
          channel: sse,
          events: [
            {
              action: 'register',
              actor: 'casdoor/op-1',
              reason: null,
              detail: {},
              at: '2026-10-29T08:00:00Z',
            },
          ],
          trials: [],
        }),
      'POST /api/admin/v1/supply/channels/sse/review': () =>
        Response.json({ code: 'trial_required' }, { status: 409 }),
    })
    show(<ChannelsPanel csrfToken="csrf-token-0123456789-0123456789-abcd" />)
    fireEvent.click(await screen.findByRole('button', { name: '上交所定期报告' }))
    const detail = await screen.findByRole('region', { name: '上交所定期报告' })
    expect(within(detail).getByText('最近一次试采没有成功，还不能放行。')).toBeInTheDocument()
    expect(within(detail).getByText('登记')).toBeInTheDocument()
    fireEvent.change(within(detail).getByLabelText('凭什么'), { target: { value: '要登录' } })
    expect(within(detail).getByRole('button', { name: '放行' })).toBeDisabled()
    fireEvent.click(within(detail).getByRole('button', { name: '审不过' }))
    expect(await within(detail).findByRole('status')).toHaveTextContent(
      '放行之前要先试采成功一次。',
    )
    expect(calls.at(-1)?.body).toEqual({ decision: 'reject', reason: '要登录' })
    // 放行时要定「区」：默认取渠道现在的
    expect(within(detail).getByLabelText('区')).toHaveValue('disclosure')
  })
})

describe('试采的样例按大类给', () => {
  it('通用网页的渠道试采给这个网站上的网址，站内搜索给话题', async () => {
    const site = {
      ...cninfo,
      channel_id: 'site-www-stats-gov-cn',
      name: 'www.stats.gov.cn',
      kind: 'web',
      plugin: 'web',
      review: 'pending',
      domain: 'www.stats.gov.cn',
    }
    serve({
      'GET /api/admin/v1/supply/channels': () => Response.json({ ...list, items: [site] }),
      'GET /api/admin/v1/supply/channels/site-www-stats-gov-cn': () =>
        Response.json({ channel: site, events: [], trials: [] }),
      'POST /api/admin/v1/supply/channels/site-www-stats-gov-cn/trials': () =>
        Response.json(
          {
            trial_id: 't-1',
            key: { url: 'https://www.stats.gov.cn/sj/a.html' },
            status: 'queued',
            requested_by: 'op',
            created_at: '2026-10-29T08:00:00Z',
            finished_at: null,
            listed: [],
            fetched: null,
            error: null,
          },
          { status: 202 },
        ),
    })
    show(<ChannelsPanel csrfToken="csrf-token-0123456789-0123456789-abcd" />)
    fireEvent.click(await screen.findByRole('button', { name: 'www.stats.gov.cn' }))
    const detail = await screen.findByRole('region', { name: 'www.stats.gov.cn' })
    expect(within(detail).queryByLabelText('主体（证券代码带市场）')).toBeNull()
    fireEvent.change(within(detail).getByLabelText('样例网址（要在登记的网站上）'), {
      target: { value: 'https://www.stats.gov.cn/sj/a.html' },
    })
    fireEvent.click(within(detail).getByRole('button', { name: '试采' }))
    await vi.waitFor(() =>
      expect(calls.find((c) => c.method === 'POST')?.body).toEqual({
        url: 'https://www.stats.gov.cn/sj/a.html',
      }),
    )
  })
})

describe('待审网站', () => {
  it('列出每个网站等了多久、几项在等；等太久就告警', async () => {
    serve({
      'GET /api/admin/v1/supply/channels': () => Response.json(list),
      'GET /api/admin/v1/supply/sites': () =>
        Response.json({
          pending: 1,
          oldest_since: '2026-10-26T12:00:00Z',
          alerts: ['waiting_too_long'],
          review_within_days: 7,
          alert_count: 10,
          alert_wait_hours: 48,
          items: [
            {
              channel_id: 'site-www-stats-gov-cn',
              domain: 'www.stats.gov.cn',
              since: '2026-10-26T12:00:00Z',
              waiting_items: 3,
              users: 2,
              oldest_item_at: '2026-10-26T12:00:00Z',
            },
          ],
        }),
    })
    show(<SitesPanel csrfToken="csrf-token-0123456789-0123456789-abcd" />)
    expect(await screen.findByRole('alert')).toHaveTextContent('有网站已经等了 48 小时以上')
    const row = within(screen.getByRole('table', { name: '待审网站' })).getAllByRole('row')[1]
    expect(within(row).getByText('www.stats.gov.cn')).toBeInTheDocument()
    expect(within(row).getByText('72 小时')).toBeInTheDocument()
    expect(within(row).getByText('3')).toBeInTheDocument()
  })
})

describe('缺口清单', () => {
  it('默认看「这类数据还取不到」：每组几项、几个人、几个主体，看不出是谁', async () => {
    serve({
      'GET /api/admin/v1/supply/gaps?kind=uncovered': () =>
        Response.json({
          items: [
            {
              kind: 'uncovered',
              doc_type: 'statistical_bulletin',
              items: 4,
              users: 3,
              subjects: 2,
              sample_subjects: ['600519.SH', '000858.SZ'],
              first_at: '2026-10-28T00:00:00Z',
              last_at: '2026-10-29T00:00:00Z',
            },
          ],
        }),
      'GET /api/admin/v1/supply/gaps?kind=absent': () => Response.json({ items: [] }),
    })
    show(<GapsPanel />)
    const row = within(await screen.findByRole('table', { name: '缺口清单' })).getAllByRole(
      'row',
    )[1]
    expect(within(row).getByText('statistical_bulletin')).toBeInTheDocument()
    expect(within(row).getByText('4')).toBeInTheDocument()
    expect(within(row).getByText('600519.SH, 000858.SZ')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('哪种'), { target: { value: 'absent' } })
    expect(await screen.findByRole('status')).toHaveTextContent('没有这一种缺口。')
  })
})

describe('队列监控', () => {
  it('各渠道的积压与失败原因；等着的作业能马上再排', async () => {
    const job = {
      job_id: 'j-1',
      kind: 'fetch',
      channel_id: 'cninfo',
      key: { subject: '600519.SH', doc_type: 'annual_report', period_end: '2025-12-31' },
      status: 'waiting',
      tier: 1,
      attempts: 1,
      last_error: 'knowbase_error',
      created_at: '2026-10-29T08:00:00Z',
      finished_at: null,
      waiting_items: 2,
    }
    serve({
      'GET /api/admin/v1/supply/queue': () =>
        Response.json({
          since: '2026-10-28T12:00:00Z',
          channels: [
            {
              channel_id: 'cninfo',
              name: '巨潮资讯网（法定信息披露）',
              status: 'active',
              status_reason: null,
              consecutive_failures: 2,
              queued: 3,
              running: 1,
              waiting: 1,
              failed_recent: 0,
              done_recent: 7,
              oldest_open_at: '2026-10-29T10:00:00Z',
            },
            {
              channel_id: '_processing',
              name: '加工（上传的资料）',
              status: 'active',
              status_reason: null,
              consecutive_failures: 0,
              queued: 2,
              running: 0,
              waiting: 0,
              failed_recent: 0,
              done_recent: 0,
              oldest_open_at: null,
            },
          ],
          tiers: [{ tier: 1, open: 5 }],
          failures: [{ channel_id: 'cninfo', reason: 'knowbase_error', count: 1 }],
        }),
      'GET /api/admin/v1/supply/jobs': () => Response.json({ items: [job] }),
      'GET /api/admin/v1/supply/jobs/j-1': () =>
        Response.json({
          ...job,
          channel_status: 'active',
          attempt_list: [
            {
              started_at: '2026-10-29T08:00:00Z',
              finished_at: '2026-10-29T08:01:00Z',
              outcome: 'retry',
              reason: 'knowbase_error',
            },
          ],
        }),
      'POST /api/admin/v1/supply/jobs/j-1/requeue': () =>
        Response.json({ ...job, status: 'queued', channel_status: 'active', attempt_list: [] }),
    })
    show(<QueuePanel csrfToken="csrf-token-0123456789-0123456789-abcd" />)
    const row = within(await screen.findByRole('table', { name: '队列监控' })).getAllByRole(
      'row',
    )[1]
    expect(within(row).getByText('连续失败 2 次')).toBeInTheDocument()
    expect(within(row).getByText('2 小时')).toBeInTheDocument()
    expect(screen.getByText(/第 1 档 5 个/)).toBeInTheDocument()
    // 加工队列不是渠道，名字按界面语言写
    expect(screen.getByText('加工（上传的资料）')).toBeInTheDocument()
    fireEvent.click(
      await screen.findByRole('button', { name: '600519.SH · annual_report · 2025-12-31' }),
    )
    fireEvent.click(await screen.findByRole('button', { name: '马上再排' }))
    expect(await screen.findByText('已再排。')).toBeInTheDocument()
  })
})

describe('登记表', () => {
  it('改登记带上同时最多跑几个，适配器配置原样带回', async () => {
    const onSubmit = vi.fn()
    show(
      <RegistrationForm
        plugins={[{ name: 'cninfo-irm', kind: 'catalog' }]}
        initial={channelSchema.parse({
          ...cninfo,
          plugin: 'cninfo-irm',
          config: { markets: ['SZ'] },
        })}
        pending={false}
        onSubmit={onSubmit}
      />,
    )
    fireEvent.change(screen.getByLabelText('同时最多跑几个作业'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('为什么改'), { target: { value: '源站放宽' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    const [input] = onSubmit.mock.calls[0]
    expect(input.max_running).toBe(2)
    expect(input.config).toEqual({ markets: ['SZ'] })
  })
})
