import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RequestApprovals, SecuritiesPanel, WatchlistPanel } from '@/features/intake'
import messages from '@/messages/zh-CN.json'

let search = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => search,
  usePathname: () => '/zh-CN/info/requests',
  useRouter: () => ({ push: vi.fn() }),
}))

// 样例：info 后端的测试把管理接口的真实返回录下来的
const dir = join(process.cwd(), 'preview/fixtures/full')
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as {
  responses: { method: string; path: string; query: string; file: string }[]
}
function sample(path: string, query: string) {
  const found = manifest.responses.find((each) => each.path === path && each.query === query)
  return found ? readFileSync(join(dir, found.file), 'utf8') : null
}

type Call = { method: string; path: string; body: Record<string, unknown>; csrf: string | null }
let calls: Call[] = []

beforeEach(() => {
  calls = []
  search = new URLSearchParams()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init: RequestInit = {}) => {
      const [path, query = ''] = String(input).split('?')
      const method = init.method ?? 'GET'
      const headers = (init.headers ?? {}) as Record<string, string>
      if (method !== 'GET') {
        calls.push({
          method,
          path,
          body: JSON.parse(String(init.body ?? '{}')),
          csrf: headers['X-CSRF-Token'] ?? null,
        })
        // 答一份形状对的：各自清单里的第一条，或整张清单
        const list = path.includes('watchlist')
          ? sample('/api/admin/security-watchlist', '')!
          : path.includes('/ingestions')
            ? JSON.stringify(JSON.parse(sample('/api/admin/securities/002594/ingestions', '')!)[0])
            : path.includes('/registration')
              ? JSON.stringify(JSON.parse(sample('/api/admin/securities/002594/datasets', '')!)[0])
              : JSON.stringify(JSON.parse(sample('/api/admin/security-requests', '')!)[0])
        return new Response(list, { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      const body = sample(path, query)
      return new Response(body ?? JSON.stringify({ detail: 'not_found' }), {
        status: body ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )
})

afterEach(() => vi.unstubAllGlobals())

function page(children: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <NextIntlClientProvider locale="zh-CN" messages={messages} timeZone="Asia/Shanghai">
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('申请审批', () => {
  it('待批准的：公司、几个人要、每个人的理由分开列、从哪来、参考', async () => {
    page(<RequestApprovals csrfToken="csrf-for-test" />)
    const pending = within(await screen.findByRole('region', { name: '待批准' }))
    expect(await pending.findByText('601012')).toBeInTheDocument()
    expect(pending.getByText('2 个人要')).toBeInTheDocument()
    expect(pending.getByText(/要做光伏行业的对比/)).toBeInTheDocument()
    expect(pending.getAllByText(/从 investment 来/).length).toBeGreaterThan(0)
    expect(pending.getByText(/不在关注清单里；还没有数据/)).toBeInTheDocument()
    expect(pending.getByRole('link', { name: '看这家的采集记录' })).toHaveAttribute(
      'href',
      '/zh-CN/info/securities?code=601012',
    )
  })

  it('批准并加入关注清单：带着这个选项和 CSRF', async () => {
    page(<RequestApprovals csrfToken="csrf-for-test" />)
    fireEvent.click(await screen.findByRole('button', { name: '批准并加入关注清单' }))
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].path).toMatch(/\/api\/admin\/security-requests\/[0-9a-f-]{36}\/approval$/)
    expect(calls[0]).toMatchObject({ csrf: 'csrf-for-test', body: { add_to_watchlist: true } })
    expect(await screen.findByRole('status')).toHaveTextContent('已批准 601012，并加入了关注清单。')
  })

  it('拒绝必须写一句原因：不写不能确认（F-INFO-28）', async () => {
    page(<RequestApprovals csrfToken="csrf-for-test" />)
    fireEvent.click(await screen.findByRole('button', { name: '拒绝' }))
    const dialog = within(screen.getByRole('dialog', { name: '拒绝 601012 的申请' }))
    const confirm = dialog.getByRole('button', { name: '拒绝' })
    expect(confirm).toBeDisabled()
    fireEvent.change(dialog.getByRole('textbox', { name: '原因（用户看得到）' }), {
      target: { value: '光伏行业的口径还没有适配' },
    })
    expect(confirm).toBeEnabled()
    fireEvent.click(confirm)
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].path).toMatch(/\/rejection$/)
    expect(calls[0].body).toEqual({ note: '光伏行业的口径还没有适配' })
  })

  it('已处理的：可按状态筛；看谁批的、什么时候、原因', async () => {
    page(<RequestApprovals csrfToken="csrf-for-test" />)
    const handled = within(await screen.findByRole('region', { name: '已处理' }))
    await waitFor(() => expect(handled.getAllByRole('row').length).toBeGreaterThan(5))
    fireEvent.change(handled.getByRole('combobox', { name: '按状态筛' }), {
      target: { value: 'rejected' },
    })
    expect(await handled.findByText('科创板的公司暂时不采：年报的格式还没有适配')).toBeVisible()
    await waitFor(() => expect(handled.getAllByRole('row')).toHaveLength(2))
  })
})

describe('证券采集', () => {
  it('带着代码进来：这家公司的批次与数据集', async () => {
    search = new URLSearchParams('code=002594')
    page(<SecuritiesPanel csrfToken="csrf-for-test" />)
    const batches = within(await screen.findByRole('region', { name: '批次' }))
    expect(await batches.findByText('采完了')).toBeInTheDocument()
    const datasets = within(screen.getByRole('region', { name: '数据集' }))
    expect(await datasets.findByText('sz002594-financials-sample002594')).toBeInTheDocument()
    expect(datasets.getByText('已发布')).toBeInTheDocument()
    expect(datasets.getByText('已登记')).toBeInTheDocument()
    fireEvent.click(datasets.getByRole('button', { name: '重新登记' }))
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].path).toMatch(/\/api\/admin\/security-datasets\/[0-9a-f-]{36}\/registration$/)
    expect(calls[0].csrf).toBe('csrf-for-test')
  })

  it('没过质量检查的数据集：不发布，不登记，不能重新登记', async () => {
    search = new URLSearchParams('code=600436')
    page(<SecuritiesPanel csrfToken="csrf-for-test" />)
    const datasets = within(await screen.findByRole('region', { name: '数据集' }))
    expect(await datasets.findByText('没通过质量检查')).toBeInTheDocument()
    expect(datasets.getByText('没有发布，不登记')).toBeInTheDocument()
    expect(datasets.queryByRole('button', { name: '重新登记' })).toBeNull()
  })

  it('直接发起采集：不是六位数字不能发起', async () => {
    page(<SecuritiesPanel csrfToken="csrf-for-test" />)
    const start = screen.getByRole('button', { name: '发起采集' })
    expect(start).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: '证券代码' }), {
      target: { value: '601318' },
    })
    fireEvent.click(start)
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toMatchObject({
      method: 'POST',
      path: '/api/admin/securities/601318/ingestions',
      csrf: 'csrf-for-test',
    })
    expect(await screen.findByText('已发起 601318 的采集。')).toBeInTheDocument()
    // 这家上次采集失败了：批次里写着原因
    expect(await screen.findByText('source_unreachable')).toBeInTheDocument()
  })
})

describe('关注清单', () => {
  it('第一批十家；加入一家；移出一家', async () => {
    page(<WatchlistPanel csrfToken="csrf-for-test" />)
    const table = within(await screen.findByRole('table', { name: '关注清单' }))
    await waitFor(() => expect(table.getAllByRole('row')).toHaveLength(11))
    expect(table.getAllByText('第一批（2026-09-28 定）')).toHaveLength(10)

    fireEvent.change(screen.getByRole('textbox', { name: '证券代码' }), {
      target: { value: '600585' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: '备注（为什么加）' }), {
      target: { value: '水泥行业的对比要用' },
    })
    fireEvent.click(screen.getByRole('button', { name: '加入' }))
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toMatchObject({
      path: '/api/admin/security-watchlist',
      body: { security_code: '600585', note: '水泥行业的对比要用' },
    })

    fireEvent.click(table.getAllByRole('button', { name: '移出' })[0])
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.click(dialog.getByRole('button', { name: '移出' }))
    await waitFor(() => expect(calls).toHaveLength(2))
    expect(calls[1].path).toMatch(/\/api\/admin\/security-watchlist\/\d{6}\/removal$/)
  })
})
