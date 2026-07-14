import { createContext, useContext, useMemo } from "react";

import { useUiStore } from "~/store/ui";

const messages = {
  "zh-CN": {
    home: "首页",
    reference: "参考页面",
    richReference: "富组件参考",
    infoCrawl: "资讯采集与治理",
    workspace: "工作台",
    logout: "退出登录",
    collapse: "收起菜单",
    expand: "展开菜单",
    openMenu: "打开菜单",
    theme: "主题",
    themeLight: "浅色",
    themeDark: "深色",
    themeSystem: "跟随系统",
    showTabs: "显示标签页",
    showBreadcrumb: "显示面包屑",
    settings: "界面设置",
    settingsDescription: "这些偏好只影响当前浏览器的界面，不保存业务数据。",
    primaryColor: "主题色",
    density: "内容密度",
    densityComfortable: "舒适",
    densityCompact: "紧凑",
    language: "语言",
    navigation: "主导航",
    navigationDisplay: "导航显示",
    closeOthers: "关闭其他标签",
    closeLeft: "关闭左侧标签",
    closeRight: "关闭右侧标签",
    closeAll: "关闭全部标签",
    page: "页面",
  },
  en: {
    home: "Home",
    reference: "Reference",
    richReference: "Rich reference",
    infoCrawl: "Info ingestion & governance",
    workspace: "Workspace",
    logout: "Sign out",
    collapse: "Collapse menu",
    expand: "Expand menu",
    openMenu: "Open menu",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    showTabs: "Show tabs",
    showBreadcrumb: "Show breadcrumb",
    settings: "Interface settings",
    settingsDescription:
      "These preferences only affect this browser UI and never store business data.",
    primaryColor: "Primary color",
    density: "Density",
    densityComfortable: "Comfortable",
    densityCompact: "Compact",
    language: "Language",
    navigation: "Primary navigation",
    navigationDisplay: "Navigation display",
    closeOthers: "Close other tabs",
    closeLeft: "Close tabs to the left",
    closeRight: "Close tabs to the right",
    closeAll: "Close all tabs",
    page: "Page",
  },
} as const;

export type Locale = keyof typeof messages;
export type MessageKey = keyof (typeof messages)["zh-CN"];

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useUiStore();
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: MessageKey) => messages[locale][key],
    }),
    [locale, setLocale],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
