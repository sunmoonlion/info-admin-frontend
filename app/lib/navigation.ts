import {
  ChartNoAxesCombined,
  CircleAlert,
  Gauge,
  Globe,
  ListChecks,
  ListOrdered,
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
    | 'supplyChannels'
    | 'supplySites'
    | 'supplyGaps'
    | 'supplyQueue'
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
  // 来源目录、待审网站、缺口清单、队列监控（SDD 0045 第一节）
  {
    key: 'supply-channels',
    path: '/knowfeed/channels',
    labelKey: 'supplyChannels',
    icon: ListChecks,
    requiredRoles: ['admin', 'operator'],
  },
  {
    key: 'supply-sites',
    path: '/knowfeed/sites',
    labelKey: 'supplySites',
    icon: Globe,
    requiredRoles: ['admin', 'operator'],
  },
  {
    key: 'supply-gaps',
    path: '/knowfeed/gaps',
    labelKey: 'supplyGaps',
    icon: CircleAlert,
    requiredRoles: ['admin', 'operator'],
  },
  {
    key: 'supply-queue',
    path: '/knowfeed/queue',
    labelKey: 'supplyQueue',
    icon: ListOrdered,
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
