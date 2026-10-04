import {
  ChartNoAxesCombined,
  Database,
  Gauge,
  Inbox,
  ListChecks,
  Rss,
  Settings,
  TableProperties,
  type LucideIcon,
} from 'lucide-react'

export type AdminNavigationItem = {
  key: string
  path: string
  labelKey:
    | 'dashboard'
    | 'reference'
    | 'richReference'
    | 'settings'
    | 'infoCrawl'
    | 'infoRequests'
    | 'infoSecurities'
    | 'infoWatchlist'
  icon: LucideIcon
  requiredRoles?: readonly string[]
  pinned?: boolean
}

export const adminNavigation: readonly AdminNavigationItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    labelKey: 'dashboard',
    icon: Gauge,
    pinned: true,
  },
  // 数据入库：申请审批、证券采集、关注清单（PRD/apps/info.md 5.3 至 5.5）。只给 info 管理员
  {
    key: 'info-requests',
    path: '/info/requests',
    labelKey: 'infoRequests',
    icon: Inbox,
    requiredRoles: ['admin'],
  },
  {
    key: 'info-securities',
    path: '/info/securities',
    labelKey: 'infoSecurities',
    icon: Database,
    requiredRoles: ['admin'],
  },
  {
    key: 'info-watchlist',
    path: '/info/watchlist',
    labelKey: 'infoWatchlist',
    icon: ListChecks,
    requiredRoles: ['admin'],
  },
  {
    key: 'info-crawl',
    path: '/info/crawl',
    labelKey: 'infoCrawl',
    icon: Rss,
    requiredRoles: ['admin', 'operator'],
  },
  {
    key: 'reference',
    path: '/reference',
    labelKey: 'reference',
    icon: TableProperties,
    requiredRoles: ['admin', 'operator'],
  },
  {
    key: 'rich-reference',
    path: '/rich-reference',
    labelKey: 'richReference',
    icon: ChartNoAxesCombined,
    requiredRoles: ['admin'],
  },
  {
    key: 'settings',
    path: '/settings',
    labelKey: 'settings',
    icon: Settings,
  },
]

export function filterNavigationByRoles(
  roles: readonly string[],
  items: readonly AdminNavigationItem[] = adminNavigation,
) {
  const roleSet = new Set(roles)
  return items.filter(
    (item) => !item.requiredRoles || item.requiredRoles.some((role) => roleSet.has(role)),
  )
}

export function findNavigationItem(pathname: string) {
  const pathWithoutLocale = pathname.replace(/^\/(?:en|zh-CN)(?=\/|$)/, '') || '/'
  return adminNavigation.find(
    (item) =>
      pathWithoutLocale === item.path ||
      (item.path !== '/dashboard' && pathWithoutLocale.startsWith(`${item.path}/`)),
  )
}
