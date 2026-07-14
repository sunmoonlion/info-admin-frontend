import { expect, test, type Page } from "@playwright/test";

async function openAdminHome(page: Page) {
  await page.goto("/");
  try {
    // A cold Vite dependency-optimization pass can invalidate the first client
    // module graph. One reload is allowed, while a real loader failure still
    // fails deterministically on the second attempt.
    await expect(page.getByRole("heading", { name: "管理首页" })).toBeVisible({
      timeout: 15000,
    });
  } catch {
    await page.reload();
    await expect(page.getByRole("heading", { name: "管理首页" })).toBeVisible({
      timeout: 45000,
    });
  }
}

test("navigates through the Vue-aligned admin shell", async ({ page }) => {
  await openAdminHome(page);

  // The sidebar is an Ant Design Menu, whose items expose the "menuitem" role
  // (navigation happens via onClick, not an anchor element).
  await page.getByRole("menuitem", { name: "参考页面" }).click();
  await expect(
    page.getByRole("heading", { name: "表格与操作参考页" }),
  ).toBeVisible();
  await expect(page.getByText("工作台", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("参考页面", { exact: true }).last(),
  ).toBeVisible();

  await page.getByRole("button", { name: "详情" }).first().click();
  const detail = page.getByRole("dialog");
  await expect(detail).toBeVisible();
  await expect(detail.getByText("操作详情")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(detail).toBeHidden();

  await page
    .locator(".ant-tabs-tab")
    .filter({ hasText: "参考页面" })
    .locator(".ant-tabs-tab-remove")
    .click();
  await expect(page.getByRole("heading", { name: "管理首页" })).toBeVisible();
});

test("provides keyboard reachable landmarks and login action", async ({
  page,
}) => {
  await openAdminHome(page);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { name: "欢迎回来" })).toBeVisible();
  const loginAction = page.getByRole("link", { name: "使用 Casdoor 登录" });
  await expect(loginAction).toBeVisible();
  await loginAction.focus();
  await expect(loginAction).toBeFocused();
});

test("renders the rich and utility reference route", async ({ page }) => {
  await openAdminHome(page);
  await page.getByRole("menuitem", { name: "富组件参考" }).click();
  await expect(
    page.getByRole("heading", { name: "富组件与通用工具参考页" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "首页图标" })).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Fixture throughput数据" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox")).toBeVisible();
  await expect(page.getByText("媒体加载失败")).toBeVisible();
});

test("honors reduced motion and preserves keyboard focus", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openAdminHome(page);
  const settings = page.getByRole("button", { name: "界面设置" });
  await settings.focus();
  await expect(settings).toBeFocused();
  await page.getByRole("menuitem", { name: "富组件参考" }).click();
  const progress = page.getByRole("group", { name: "Fixture progress" });
  await expect(progress).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches))
    .toBe(true);
});

test("persists theme, density and language preferences", async ({ page }) => {
  await openAdminHome(page);

  await page.getByRole("button", { name: "界面设置" }).click();
  await page.getByText("深色", { exact: true }).click();
  await page.getByText("紧凑", { exact: true }).click();
  await page.getByText("English", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  await expect(page.getByRole("menuitem", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "管理首页" })).toBeVisible();
});

test("uses a mobile drawer instead of the desktop sider", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdminHome(page);

  await page.getByRole("button", { name: "打开菜单" }).click();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
  await page.getByRole("menuitem", { name: "参考页面" }).click();
  await expect(
    page.getByRole("heading", { name: "表格与操作参考页" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeHidden();
});

test("logs out through a POST request", async ({ page }) => {
  let method = "";
  await page.route("**/api/auth/logout", async (route) => {
    method = route.request().method();
    await route.fulfill({ status: 204, body: "" });
  });

  await openAdminHome(page);
  await page.getByRole("button", { name: /Demo Admin/ }).click();
  await page.getByRole("menuitem", { name: "退出登录" }).click();
  await expect(page.getByRole("heading", { name: "欢迎回来" })).toBeVisible();
  expect(method).toBe("POST");
});
