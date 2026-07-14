import {
  HOME_TAB,
  tabsAfterClose,
  tabsAfterRemove,
  useUiStore,
  type OpenTab,
} from "~/store/ui";

const referenceTab: OpenTab = {
  path: "/reference",
  labelKey: "reference",
};

describe("ui store", () => {
  beforeEach(() => {
    localStorage.clear();
    useUiStore.setState({
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      tabs: [{ ...HOME_TAB }],
      themeMode: "light",
      themeColor: "#1677ff",
      density: "comfortable",
      locale: "zh-CN",
      showTabs: true,
      showBreadcrumb: true,
    });
  });

  it("deduplicates open tabs and keeps translated metadata current", () => {
    useUiStore.getState().addTab(referenceTab);
    useUiStore.getState().addTab({ ...referenceTab, labelKey: "reference" });
    expect(useUiStore.getState().tabs).toEqual([HOME_TAB, referenceTab]);
  });

  it("never removes the pinned home tab", () => {
    expect(tabsAfterRemove([HOME_TAB, referenceTab], "/")).toEqual([
      HOME_TAB,
      referenceTab,
    ]);
    useUiStore.getState().removeTab("/");
    expect(useUiStore.getState().tabs).toEqual([HOME_TAB]);
  });

  it("supports deterministic bulk tab close actions", () => {
    const auditTab: OpenTab = { path: "/audit", labelKey: "page" };
    const tabs = [HOME_TAB, referenceTab, auditTab];

    expect(tabsAfterClose(tabs, "closeOthers", "/reference")).toEqual([
      HOME_TAB,
      referenceTab,
    ]);
    expect(tabsAfterClose(tabs, "closeRight", "/reference")).toEqual([
      HOME_TAB,
      referenceTab,
    ]);
    expect(tabsAfterClose(tabs, "closeLeft", "/audit")).toEqual([
      HOME_TAB,
      auditTab,
    ]);
    expect(tabsAfterClose(tabs, "closeAll", "/reference")).toEqual([HOME_TAB]);
  });

  it("reconciles persisted tabs against the current permission-filtered menu", () => {
    useUiStore.setState({
      tabs: [referenceTab, { path: "/removed", labelKey: "page" }],
    });
    useUiStore.getState().reconcileTabs([HOME_TAB, referenceTab]);
    expect(useUiStore.getState().tabs).toEqual([HOME_TAB, referenceTab]);

    useUiStore.getState().reconcileTabs([HOME_TAB]);
    expect(useUiStore.getState().tabs).toEqual([HOME_TAB]);
  });

  it("persists theme, density and language without business state", () => {
    useUiStore.getState().setThemeMode("dark");
    useUiStore.getState().setDensity("compact");
    useUiStore.getState().setLocale("en");

    const persisted = JSON.parse(
      localStorage.getItem("tpl-admin-ui") ?? "{}",
    ) as { state?: Record<string, unknown> };
    expect(persisted.state).toMatchObject({
      themeMode: "dark",
      density: "compact",
      locale: "en",
    });
    expect(persisted.state).not.toHaveProperty("user");
  });
});
