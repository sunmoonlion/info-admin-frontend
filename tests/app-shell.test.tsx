import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from "react-router";

import { AppShell } from "~/components/app-shell";
import type { AuthUser } from "~/lib/auth";
import { LocaleProvider } from "~/lib/i18n";
import { HOME_TAB, useUiStore } from "~/store/ui";

function renderShell(user: AuthUser, initialEntry = "/") {
  const routes: RouteObject[] = [
    {
      path: "/",
      element: (
        <LocaleProvider>
          <AppShell user={user} />
        </LocaleProvider>
      ),
      children: [
        { index: true, element: <h1>Home content</h1> },
        { path: "reference", element: <h1>Reference content</h1> },
        { path: "forbidden", element: <h1>Forbidden content</h1> },
      ],
    },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return { router, ...render(<RouterProvider router={router} />) };
}

describe("AppShell", () => {
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

  it("uses one metadata source for permission-filtered menu and breadcrumbs", () => {
    renderShell({ id: "user-1", name: "Reader", roles: ["users"], scopes: [] });
    expect(screen.getByRole("menuitem", { name: "首页" })).toBeVisible();
    expect(
      screen.queryByRole("menuitem", { name: "参考页面" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "工作台" })).toBeVisible();
  });

  it("redirects a known but unauthorized route to the forbidden page", async () => {
    const { router } = renderShell(
      { id: "user-1", name: "Reader", roles: ["users"], scopes: [] },
      "/reference",
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/forbidden"),
    );
    expect(
      screen.getByRole("heading", { name: "Forbidden content" }),
    ).toBeVisible();
  });

  it("opens interface settings and persists density and language", async () => {
    renderShell({ id: "admin-1", name: "Admin", roles: ["admin"], scopes: [] });
    fireEvent.click(screen.getByRole("button", { name: "界面设置" }));
    expect(
      await screen.findByText(
        "这些偏好只影响当前浏览器的界面，不保存业务数据。",
      ),
    ).toBeVisible();

    fireEvent.click(screen.getByText("紧凑"));
    expect(useUiStore.getState().density).toBe("compact");
    fireEvent.click(screen.getByText("English"));
    expect(useUiStore.getState().locale).toBe("en");
  });
});
