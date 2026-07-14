import type { LucideIcon, LucideProps } from "lucide-react";
import {
  AlertCircle,
  Check,
  CircleHelp,
  Download,
  Home,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  Upload,
  User,
  X,
} from "lucide-react";

const icons = {
  alert: AlertCircle,
  check: Check,
  download: Download,
  home: Home,
  more: MoreHorizontal,
  pause: Pause,
  play: Play,
  refresh: RefreshCw,
  search: Search,
  settings: Settings,
  upload: Upload,
  user: User,
  close: X,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export interface AppIconProps extends Omit<LucideProps, "ref"> {
  name: string;
  label?: string;
}

/** Local icon registry; arbitrary remote SVG/HTML is deliberately unsupported. */
export function AppIcon({ name, label, ...props }: AppIconProps) {
  const Icon = icons[name as IconName] ?? CircleHelp;
  return (
    <Icon
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}

export function isIconName(value: string): value is IconName {
  return value in icons;
}
