import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Locale, MessageKey } from "~/lib/i18n";

export interface OpenTab {
  path: string;
  labelKey: MessageKey;
  pinned?: boolean;
}

export type ThemeMode = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type TabCloseAction =
  "closeOthers" | "closeLeft" | "closeRight" | "closeAll";

export const HOME_TAB: OpenTab = {
  path: "/",
  labelKey: "home",
  pinned: true,
};

interface UiState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  tabs: OpenTab[];
  themeMode: ThemeMode;
  themeColor: string;
  density: Density;
  locale: Locale;
  showTabs: boolean;
  showBreadcrumb: boolean;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  addTab: (tab: OpenTab) => void;
  removeTab: (path: string) => void;
  closeTabs: (action: TabCloseAction, activePath: string) => void;
  reconcileTabs: (allowedTabs: readonly OpenTab[]) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: string) => void;
  setDensity: (density: Density) => void;
  setLocale: (locale: Locale) => void;
  setShowTabs: (visible: boolean) => void;
  setShowBreadcrumb: (visible: boolean) => void;
}

export function tabsAfterClose(
  tabs: readonly OpenTab[],
  action: TabCloseAction,
  activePath: string,
): OpenTab[] {
  const activeIndex = tabs.findIndex((tab) => tab.path === activePath);
  if (activeIndex < 0) return [...tabs];

  return tabs.filter((tab, index) => {
    if (tab.pinned) return true;
    if (action === "closeAll") return false;
    if (action === "closeOthers") return tab.path === activePath;
    if (action === "closeLeft") return index >= activeIndex;
    return index <= activeIndex;
  });
}

export function tabsAfterRemove(
  tabs: readonly OpenTab[],
  path: string,
): OpenTab[] {
  return tabs.filter((tab) => tab.path !== path || tab.pinned);
}

function reconcileAllowedTabs(
  tabs: readonly OpenTab[],
  allowedTabs: readonly OpenTab[],
): OpenTab[] {
  const allowed = new Map(allowedTabs.map((tab) => [tab.path, tab]));
  const retained = tabs.flatMap((tab) => {
    const current = allowed.get(tab.path);
    return current ? [{ ...current }] : [];
  });
  const retainedPaths = new Set(retained.map((tab) => tab.path));
  const missingPinned = allowedTabs.filter(
    (tab) => tab.pinned && !retainedPaths.has(tab.path),
  );
  return [...missingPinned, ...retained];
}

function migratePersistedState(persisted: unknown): Partial<UiState> {
  if (!persisted || typeof persisted !== "object") return {};
  const state = persisted as Record<string, unknown>;
  const tabs = Array.isArray(state.tabs)
    ? state.tabs.flatMap((value): OpenTab[] => {
        if (!value || typeof value !== "object") return [];
        const tab = value as Record<string, unknown>;
        if (tab.path === "/") return [{ ...HOME_TAB }];
        if (tab.path === "/reference") {
          return [{ path: "/reference", labelKey: "reference" }];
        }
        return [];
      })
    : [HOME_TAB];
  return {
    ...state,
    tabs: tabs.length ? tabs : [HOME_TAB],
  } as Partial<UiState>;
}

const defaultLocale: Locale =
  import.meta.env.VITE_DEFAULT_LOCALE === "en" ? "en" : "zh-CN";

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      tabs: [{ ...HOME_TAB }],
      themeMode: "light",
      themeColor: "#1677ff",
      density: "comfortable",
      locale: defaultLocale,
      showTabs: true,
      showBreadcrumb: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      addTab: (tab) =>
        set((state) => {
          const existing = state.tabs.find((item) => item.path === tab.path);
          if (existing) {
            return {
              tabs: state.tabs.map((item) =>
                item.path === tab.path ? { ...item, ...tab } : item,
              ),
            };
          }
          return { tabs: [...state.tabs, tab] };
        }),
      removeTab: (path) =>
        set((state) => ({ tabs: tabsAfterRemove(state.tabs, path) })),
      closeTabs: (action, activePath) =>
        set((state) => ({
          tabs: tabsAfterClose(state.tabs, action, activePath),
        })),
      reconcileTabs: (allowedTabs) =>
        set((state) => ({
          tabs: reconcileAllowedTabs(state.tabs, allowedTabs),
        })),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setThemeColor: (color) => set({ themeColor: color }),
      setDensity: (density) => set({ density }),
      setLocale: (locale) => set({ locale }),
      setShowTabs: (visible) => set({ showTabs: visible }),
      setShowBreadcrumb: (visible) => set({ showBreadcrumb: visible }),
    }),
    {
      name: "tpl-admin-ui",
      version: 2,
      migrate: migratePersistedState,
      partialize: ({
        sidebarCollapsed,
        tabs,
        themeMode,
        themeColor,
        density,
        locale,
        showTabs,
        showBreadcrumb,
      }) => ({
        sidebarCollapsed,
        tabs,
        themeMode,
        themeColor,
        density,
        locale,
        showTabs,
        showBreadcrumb,
      }),
    },
  ),
);
