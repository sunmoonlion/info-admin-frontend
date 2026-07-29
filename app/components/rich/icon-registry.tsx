import {
  CircleHelp,
  Database,
  FileText,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

const iconRegistry = {
  database: Database,
  document: FileText,
  search: Search,
  security: ShieldCheck,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof iconRegistry

export function RegistryIcon({ name, label }: { name: string; label: string }) {
  const Icon = iconRegistry[name as IconName] ?? CircleHelp
  return <Icon role="img" aria-label={label} />
}

export function availableIcons() {
  return Object.keys(iconRegistry) as IconName[]
}
