import {
  Avatar,
  Breadcrumb,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu as AntMenu,
  Space,
  Tabs,
  Typography,
  type MenuProps,
} from "antd";
import { ChevronRight, Languages, LogOut, Menu, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { InterfaceSettings } from "~/components/interface-settings";
import type { AuthUser } from "~/lib/auth";
import { logout } from "~/lib/auth";
import { appConfig } from "~/lib/config";
import { useLocale } from "~/lib/i18n";
import {
  filterNavigation,
  findNavigationItem,
  findNavigationTrail,
  flattenNavigation,
  navigationItems,
  type NavigationItem,
} from "~/lib/navigation";
import { useMediaQuery } from "~/lib/use-media-query";
import {
  tabsAfterClose,
  tabsAfterRemove,
  useUiStore,
  type OpenTab,
  type TabCloseAction,
} from "~/store/ui";

type AntMenuItem = Required<MenuProps>["items"][number];

function createMenuItems(
  items: readonly NavigationItem[],
  t: ReturnType<typeof useLocale>["t"],
): AntMenuItem[] {
  return items.map(({ children, icon: Icon, key, labelKey, path }) => ({
    key: path ?? key,
    icon: Icon ? <Icon aria-hidden="true" size={18} /> : undefined,
    label: t(labelKey),
    children: children ? createMenuItems(children, t) : undefined,
  }));
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark">S</span>
      {!collapsed && <strong>{appConfig.name}</strong>}
    </div>
  );
}

export function AppShell({ user }: { user: AuthUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const {
    mobileMenuOpen,
    reconcileTabs,
    removeTab,
    setMobileMenuOpen,
    showBreadcrumb,
    showTabs,
    sidebarCollapsed,
    tabs,
    toggleSidebar,
    addTab,
    closeTabs,
  } = useUiStore();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login");
      setLoggingOut(false);
    }
  }

  const visibleNavigation = useMemo(
    () => filterNavigation(navigationItems, user.roles),
    [user.roles],
  );
  const visibleLeaves = useMemo(
    () => flattenNavigation(visibleNavigation),
    [visibleNavigation],
  );
  const activeItem = findNavigationItem(visibleNavigation, location.pathname);
  const configuredItem = findNavigationItem(navigationItems, location.pathname);
  const breadcrumbTrail = findNavigationTrail(
    visibleNavigation,
    location.pathname,
  );
  const allowedTabs = useMemo<OpenTab[]>(
    () =>
      visibleLeaves.map((item) => ({
        path: item.path,
        labelKey: item.labelKey,
        pinned: item.pinned,
      })),
    [visibleLeaves],
  );
  const menuItems = useMemo(
    () => createMenuItems(visibleNavigation, t),
    [t, visibleNavigation],
  );
  const openMenuKeys = visibleNavigation
    .filter((item) => item.children?.length)
    .map((item) => item.key);

  useEffect(() => {
    reconcileTabs(allowedTabs);
  }, [allowedTabs, reconcileTabs]);

  useEffect(() => {
    if (configuredItem && !activeItem) {
      void navigate("/forbidden", { replace: true });
      return;
    }
    if (activeItem) {
      addTab({
        path: activeItem.path,
        labelKey: activeItem.labelKey,
        pinned: activeItem.pinned,
      });
    }
  }, [activeItem, addTab, configuredItem, navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  function navigateFromMenu(path: string) {
    if (!path.startsWith("/")) return;
    setMobileMenuOpen(false);
    void navigate(path);
  }

  function navigateAfterTabsChange(
    remaining: readonly OpenTab[],
    removedPath: string,
    removedIndex: number,
  ) {
    if (removedPath !== location.pathname) return;
    const fallback =
      remaining[Math.min(removedIndex, remaining.length - 1)]?.path ?? "/";
    void navigate(fallback);
  }

  function handleTabRemove(path: string) {
    const index = tabs.findIndex((tab) => tab.path === path);
    if (index < 0 || tabs[index]?.pinned) return;
    const remaining = tabsAfterRemove(tabs, path);
    removeTab(path);
    navigateAfterTabsChange(remaining, path, index);
  }

  function handleTabCloseAction(action: TabCloseAction) {
    const activeIndex = tabs.findIndex((tab) => tab.path === location.pathname);
    const remaining = tabsAfterClose(tabs, action, location.pathname);
    closeTabs(action, location.pathname);
    if (!remaining.some((tab) => tab.path === location.pathname)) {
      const fallback =
        remaining[Math.min(activeIndex, remaining.length - 1)]?.path ?? "/";
      void navigate(fallback);
    }
  }

  const navigation = (
    <nav aria-label={t("navigation")} className="navigation-menu">
      <AntMenu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={openMenuKeys}
        onClick={({ key }) => navigateFromMenu(key)}
        items={menuItems}
      />
    </nav>
  );

  return (
    <Layout className="app-shell">
      {!isMobile && (
        <Layout.Sider
          className="sidebar"
          collapsed={sidebarCollapsed}
          width={252}
          collapsedWidth={68}
          trigger={null}
          aria-label={t("navigation")}
        >
          <Brand collapsed={sidebarCollapsed} />
          {navigation}
        </Layout.Sider>
      )}

      <Drawer
        title={null}
        placement="left"
        open={isMobile && mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        size={280}
        closable={false}
        destroyOnHidden
        rootClassName="mobile-navigation-drawer"
        aria-label={t("navigation")}
      >
        <Brand />
        {navigation}
      </Drawer>

      <Layout className="workspace">
        <Layout.Header className="topbar">
          <Button
            type="text"
            icon={
              isMobile ? (
                <Menu size={20} />
              ) : sidebarCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <Menu size={20} />
              )
            }
            onClick={() =>
              isMobile ? setMobileMenuOpen(true) : toggleSidebar()
            }
            aria-label={
              isMobile
                ? t("openMenu")
                : sidebarCollapsed
                  ? t("expand")
                  : t("collapse")
            }
          />
          {showBreadcrumb && (
            <Breadcrumb
              className="breadcrumb"
              items={[
                { title: appConfig.name },
                ...(breadcrumbTrail.length
                  ? breadcrumbTrail.map((item) => ({ title: t(item.labelKey) }))
                  : [{ title: t("page") }]),
              ]}
            />
          )}
          <Space className="topbar-actions">
            <Button
              type="text"
              icon={<Languages size={17} />}
              onClick={() => setLocale(locale === "zh-CN" ? "en" : "zh-CN")}
              aria-label={t("language")}
            >
              {locale === "zh-CN" ? "EN" : "中文"}
            </Button>
            <Button
              type="text"
              icon={<Settings size={17} />}
              onClick={() => setSettingsOpen(true)}
              aria-label={t("settings")}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogOut size={16} />,
                    label: (
                      <button
                        type="button"
                        className="menu-action"
                        disabled={loggingOut}
                        onClick={() => void handleLogout()}
                      >
                        {t("logout")}
                      </button>
                    ),
                  },
                ],
              }}
            >
              <Button type="text">
                <Space>
                  <Avatar size="small">
                    {user.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Typography.Text className="user-name">
                    {user.name}
                  </Typography.Text>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Layout.Header>

        {showTabs && (
          <Tabs
            className="header-tabs"
            activeKey={
              tabs.some((tab) => tab.path === location.pathname)
                ? location.pathname
                : undefined
            }
            type="editable-card"
            hideAdd
            onChange={(path) => void navigate(path)}
            onEdit={(path, action) =>
              action === "remove" && handleTabRemove(String(path))
            }
            tabBarExtraContent={
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "closeOthers",
                      label: t("closeOthers"),
                    },
                    { key: "closeLeft", label: t("closeLeft") },
                    { key: "closeRight", label: t("closeRight") },
                    { key: "closeAll", label: t("closeAll") },
                  ],
                  onClick: ({ key }) =>
                    handleTabCloseAction(key as TabCloseAction),
                }}
              >
                <Button type="text" aria-label={t("closeOthers")}>
                  •••
                </Button>
              </Dropdown>
            }
            items={tabs.map((tab) => ({
              key: tab.path,
              label: t(tab.labelKey),
              closable: !tab.pinned,
            }))}
          />
        )}

        <Layout.Content className="content" id="main-content" role="main">
          <Outlet />
        </Layout.Content>
      </Layout>

      <InterfaceSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Layout>
  );
}
