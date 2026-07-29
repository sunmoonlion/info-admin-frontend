import {
  Boxes,
  Home,
  Palette,
  Rss,
  Table2,
  type LucideIcon,
} from "lucide-react";

import type { MessageKey } from "~/lib/i18n";

export interface NavigationItem {
  key: string;
  labelKey: MessageKey;
  icon?: LucideIcon;
  path?: string;
  pinned?: boolean;
  requiredRoles?: readonly string[];
  children?: readonly NavigationItem[];
}

export interface NavigationLeaf extends NavigationItem {
  path: string;
  children?: never;
}

export const navigationItems: readonly NavigationItem[] = [
  {
    key: "workspace",
    labelKey: "workspace",
    icon: Boxes,
    children: [
      {
        key: "home",
        path: "/",
        labelKey: "home",
        icon: Home,
        pinned: true,
      },
      {
        key: "reference",
        path: "/reference",
        labelKey: "reference",
        icon: Table2,
        requiredRoles: ["admin", "operator"],
      },
      {
        key: "rich-reference",
        path: "/rich-reference",
        labelKey: "richReference",
        icon: Palette,
        requiredRoles: ["admin", "operator"],
      },
      {
        key: "info-crawl",
        path: "/info/crawl",
        labelKey: "infoCrawl",
        icon: Rss,
        requiredRoles: ["admin", "operator"],
      },
    ],
  },
];

export function hasRequiredRole(
  item: NavigationItem,
  roles: readonly string[],
): boolean {
  if (!item.requiredRoles?.length) return true;
  if (roles.includes("*")) return true;
  return item.requiredRoles.some((role) => roles.includes(role));
}

export function filterNavigation(
  items: readonly NavigationItem[],
  roles: readonly string[],
): NavigationItem[] {
  return items.flatMap((item) => {
    if (!hasRequiredRole(item, roles)) return [];
    if (!item.children) return [{ ...item }];

    const children = filterNavigation(item.children, roles);
    return children.length ? [{ ...item, children }] : [];
  });
}

export function flattenNavigation(
  items: readonly NavigationItem[],
): NavigationLeaf[] {
  return items.flatMap((item) =>
    item.children
      ? flattenNavigation(item.children)
      : item.path
        ? [item as NavigationLeaf]
        : [],
  );
}

export function findNavigationTrail(
  items: readonly NavigationItem[],
  path: string,
): NavigationItem[] {
  for (const item of items) {
    if (item.path === path) return [item];
    if (item.children) {
      const childTrail = findNavigationTrail(item.children, path);
      if (childTrail.length) return [item, ...childTrail];
    }
  }
  return [];
}

export function findNavigationItem(
  items: readonly NavigationItem[],
  path: string,
): NavigationLeaf | undefined {
  return flattenNavigation(items).find((item) => item.path === path);
}
