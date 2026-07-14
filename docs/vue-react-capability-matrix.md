# Vue Admin -> React Admin 能力对齐矩阵

状态：`P0-007A2 / ACCEPTED（TEMPLATE_MIGRATION_READY，2026-07-14）`

Vue 输入基线：Info `fd3a943358f622c2a9d792a4afc6fb5fbc7072d1`、Knowledge `6a337322cdd11c8c69d7f7271ee5d519ad815f34`、Research `3ef205afa26beb582d97e0f43192fce790449bb6`

React A2 冻结代码基线：`tpl-admin-frontend@168ed144e419a5b4b01abc2224d345a8ccd9785a`

本文件是 P0-007A2 的施工矩阵，不把 React 骨架误称为完整迁移。矩阵中的 `MUST` 项在没有 React 实现、测试和证据前不能标记为完成；`DEFER` 必须有明确理由、影响、owner 和后续任务。

串行顺序：`A2.1 Shell -> P0-005 接受 -> A2.2 Identity/Data -> A2.3 CRUD -> A2.4 Rich/Utility -> A2.5 Production Gate（当前）`。任何施工包必须同时完成实现、测试、可访问性、矩阵证据和提交 SHA，才可激活下一包。

## 状态定义

| 状态          | 含义                                                      |
| ------------- | --------------------------------------------------------- |
| `SKELETON`    | P0-007A 已提供接入点或中性示例，但尚未完成 Vue 能力等价   |
| `MUST`        | P0-007A2 必须完成的生产相关能力                           |
| `IN_PROGRESS` | 已开始实现，仍缺测试/证据或能力不完整                     |
| `ACCEPTED`    | 实现、测试、可访问性和固定 commit 干净重建证据齐全        |
| `DEFER`       | 非目标或 legacy 能力，已记录后续任务；不能被任何 App 依赖 |
| `REMOVE`      | 明确不再保留，并记录替代方案和迁移影响                    |

## 1. 平台、运行时和部署

| Vue 基线                                                                | React 目标                                                   | 要求                                                                       | 状态       | 验收证据                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------- | --------------------------------- |
| `src/main.ts`, `src/App.vue`                                            | `app/root.tsx`, providers                                    | React Router、Ant Design、Query、i18n、error boundary 的 provider 顺序稳定 | `ACCEPTED` | A2.1/A2.2 tests + build            |
| `vite.config.ts`, `tsconfig*.json`, `eslint.config.ts`, `uno.config.ts` | `vite.config.ts`, `tsconfig.json`, `eslint.config.js`        | strict、typegen、lint、路径和环境变量约定                                  | `ACCEPTED` | clean-room + A2.5 production gate |
| `mybuild/Dockerfile`, `mybuild/nginx.conf`, `nginx/`                    | `mybuild/Dockerfile`, `mybuild/nginx.conf`, security headers | 静态产物、history/base-path fallback、health、缓存和安全头                 | `ACCEPTED` | Docker/Nginx + Harbor digest + KIND TLS |
| `.env*`, K8s 配置接口                                                   | `.env.example`, K8s 配置接口                                 | API URL、auth mode、base path、镜像和 Secret 名称可追踪；不提交凭据        | `ACCEPTED` | production config tests            |
| `cypress/`, Vitest 约定                                                 | `e2e/`, `tests/`, Playwright/Vitest                          | 单元、组件、浏览器、a11y 和产物测试分层                                    | `ACCEPTED` | 39 Vitest/7 Playwright + clean-room + KIND |

## 2. 应用壳、路由和身份

| Vue 基线                                             | React 目标                                           | 要求                                                                      | 状态       | 验收证据                              |
| ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- | ---------- | ------------------------------------- |
| `src/layouts/default.vue`                            | `app/components/app-shell.tsx`                       | 侧栏、顶部、面包屑、内容出口、响应式密度、主题                            | `ACCEPTED` | A2.1 unit/component/Playwright/build  |
| `src/layouts/single-page.vue`, `src/layouts/404.vue` | `routes/login.tsx`, `forbidden.tsx`, `not-found.tsx` | public/protected 边界、错误状态和 return URL                              | `SKELETON` | auth/error E2E                        |
| `src/router/index.ts`, `src/pages/[...path].vue`     | `app/routes.ts`, route modules                       | route metadata、lazy split、pending/error boundary、deep link             | `ACCEPTED` | typegen/history fallback + Playwright |
| `src/store/user.ts`, login hooks                     | `app/lib/auth.ts`, auth Query/loader                 | BFF session、CSRF、401/403、logout；不把 token 写入 local/session storage | `ACCEPTED` | A2.2 identity/browser evidence        |
| `src/store/tabs.ts`, `src/utils/i18n.ts`             | `app/store/ui.ts`, `app/lib/i18n.tsx`                | 仅 UI 偏好持久化；server state 不复制到 Zustand                           | `ACCEPTED` | A2.1 store/component/Playwright/build |

### 2.1 A2.1 Shell 验收矩阵

| 能力                 | Vue 输入                              | React target / 行为                                                   | Owner                | 状态       | 测试/证据                                   |
| -------------------- | ------------------------------------- | --------------------------------------------------------------------- | -------------------- | ---------- | ------------------------------------------- |
| 菜单元数据与权限过滤 | auto routes、`VpMenu`、user roles     | `app/lib/navigation.ts`；嵌套菜单、稳定 key、角色过滤；不替代后端授权 | React Admin template | `ACCEPTED` | `navigation` + `app-shell` tests；`d2fa1a8` |
| 响应式导航           | `layouts/default.vue` mobile drawer   | `app-shell.tsx`；桌面 Sider 与移动 Drawer 不重复呈现                  | React Admin template | `ACCEPTED` | component + Playwright mobile；`d2fa1a8`    |
| 面包屑               | `Themes/Breadcrumb.vue`               | 与菜单相同元数据生成层级，支持隐藏                                    | React Admin template | `ACCEPTED` | navigation/component tests；`d2fa1a8`       |
| 可关闭标签           | Pinia tabs、HeaderTabs actions        | 固定 Home、关闭当前回退、关闭其他/左/右/全部、权限对账                | React Admin template | `ACCEPTED` | store tests + Playwright；`d2fa1a8`         |
| 主题/密度/语言       | ThemeSettings、DarkMode、ChangeLocale | Ant Design token/compact algorithm、html 属性、Zustand 持久化         | React Admin template | `ACCEPTED` | store/component/reload E2E；`d2fa1a8`       |
| route/global error   | Vue 404 与 Router error               | route boundary + root boundary；生产隐藏原始异常并提供恢复动作        | React Admin template | `ACCEPTED` | `global-error` test + build；`d2fa1a8`      |

A2.1 于 2026-07-13 以实现提交 `d2fa1a842d2ec94ee48d5a6c338d510cb4270e8a` 验收。验证结果：`pnpm lint`、`pnpm typecheck`、Vitest 6 files / 16 tests、Playwright Chromium 4 tests、`pnpm build` 全部通过。这里的 `ACCEPTED` 只覆盖 A2.1 Shell，不代表身份安全、CRUD、富组件或完整 P0-007A2 已完成。

### 2.2 A2.2 Identity/Data Foundation 当前进展

| 能力 | React 实现 | 当前状态 | 已验证 |
| --- | --- | --- | --- |
| `/api/auth/me` | 严格 contract version 1 归一化为 `AuthUser`，不把领域 DTO 带入模板 | `ACCEPTED` | 22 个模板测试；三应用 KIND 严格 TLS 模板浏览器 `/`、`/me`、session-expiry 通过 |
| Session/CSRF | HttpOnly session cookie 由后端持有；CSRF token 仅内存保存，unsafe 请求自动发送 `X-CSRF-Token` | `ACCEPTED` | 单测、三应用 CSRF 负例/正例、HttpOnly 和过期 session 通过 |
| Login/return URL | 登录 URL 仅传相对 return path；未认证 loader 统一 redirect `/login` | `ACCEPTED` | 单测、真实 Casdoor callback、过期 session 模板 redirect 通过 |
| Logout | 仅 POST `/api/auth/logout`，完成后清理内存 session 并回到登录页 | `ACCEPTED` | POST + CSRF + 清理单测；三应用真实登出通过 |
| 401/403/correlation | 401 清理内存 session；每个请求补 `X-Correlation-ID`；错误只保留结构化 message key | `ACCEPTED` | API 错误/请求头单测；401/403、跨用户 403、owner isolation 通过 |
| Query 约定 | `queryKeys.session`、资源 scope key、loader `ensureQueryData`；登出移除 session cache | `ACCEPTED` | Query/cache 单测、clean-room、模板受保护首页真实 `/me` 通过 |

A2.2 已于 2026-07-14 接受：三套 Admin 的真实 Casdoor/KIND 基础矩阵、CORS、CSRF、401/403、Research 跨用户隔离和 Redis session 过期均通过。实现 commit 为 `tpl-admin-frontend@0b68498`，扩展 consumer gate 为 `k8s@3558a08`。Docker/Nginx candidate smoke 已通过但候选镜像尚未固化；A2.5 仍负责全量 a11y、响应式/reduced-motion 和最终生产 Gate。A2.2 接受不代表三个业务前端已迁移。

严格 TLS 浏览器验收必须使用空闲的后端回调端口（当前 KIND 验收固定为 `19082`）。验收脚本在启动前以 socket 绑定检查端口占用；模板开发服务器按独立进程组启动并在 finally 中清理；若端口已有旧进程，验收必须先失败/清理，禁止复用旧实例来生成证据。

### 2.3 A2.3 CRUD Toolkit 当前进展

| 能力 | React 通用实现 | 当前状态 | 已验证 |
| --- | --- | --- | --- |
| Table/筛选/分页/加载/空/错误 | `data-table.tsx` + `server-query.ts`；领域列、分页/排序/筛选 query adapter 由 App 注入 | `ACCEPTED` | 参数归一化/稳定 query、Reference Page、CRUD 单测 |
| Form/schema/校验 | `schema-form.tsx`；字段 schema 与提交 adapter 分离 | `ACCEPTED` | schema 提交、字段校验单测 |
| Description/Detail | `resource-description.tsx`；空态和只读详情 | `ACCEPTED` | 空态单测、Reference Drawer |
| Modal/Drawer/审计写操作 | `audited-action-modal.tsx` + `use-crud-mutation.ts`；reason、correlation/operation、confirm/loading/error 边界 | `ACCEPTED` | 审计原因、状态转移和 header contract 单测、Reference Page |
| 通知 | `feedback.tsx`；统一从 Ant Design App provider 获取 notification | `ACCEPTED` | Ant Design provider 真实集成单测 |
| 上传/下载 | `contract-upload.tsx` adapter；`lib/download.ts` same-origin URL 与 Blob 下载 | `ACCEPTED` | adapter、URL 安全与 Blob 单测 |

A2.3 于 2026-07-14 以 `tpl-admin-frontend@77a25c839198b9267d54c3402738ce8196d698eb` 接受。全量验证：clean-room offline install、typecheck、lint、Vitest 8 files/31 tests、Playwright Chromium 5 tests、SPA build、`git diff --check` 均通过；组件测试覆盖 `getByRole`/`getByLabelText`/dialog 语义和通知 provider 集成。这里的可访问性只属于 A2.3 基础 smoke；完整 WCAG、responsive/reduced-motion 和生产 Gate 仍由 A2.5 验收。Reference Page 仍不是任何领域业务页面。

### 2.4 A2.4 Rich/Utility Toolkit 验收矩阵

| Vue 能力 | React 通用实现 | 状态 | 处置与证据 |
| --- | --- | --- | --- |
| AvatarList/AvatarMenu | `components/rich/avatar-tools.tsx`；键盘按钮、overflow、Dropdown command | `ACCEPTED` | 组件单测、rich reference route |
| Charts/ECharts boundary | `components/rich/metric-chart.tsx`；SVG + accessible data table；消费方可替换 renderer | `ACCEPTED` | 空/加载/错误/数据表单测、Playwright |
| Vditor Editor | `components/rich/markdown-editor.tsx`；受控纯文本 Markdown boundary，预览不注入 HTML | `ACCEPTED` | XSS-safe text、label/preview 单测；Vditor-specific WYSIWYG deferred by ADR |
| Icon registry/picker | `components/rich/icon-registry.tsx`；本地 Lucide registry，未知 key 安全回退 | `ACCEPTED` | local/fallback a11y 单测；remote Iconify/NetIcon 不进入模板 |
| Audio/Video | `components/rich/media-player.tsx`；同源 URL、原生 controls、加载错误 | `ACCEPTED` | unsafe URL/failed media browser smoke；Howler/Video.js feature parity deferred |
| Progress/Transition/Watermark | `progress-tools.tsx`；native details、reduced-motion、SVG data watermark | `ACCEPTED` | 语义单测、全局 reduced-motion CSS |
| copy/debounce/throttle/drag/long-press/flash/scrollText | `app/lib/rich-utils.ts` + `text-effects.tsx`；hooks/components，不模拟 Vue directive | `ACCEPTED` | copy、long-press、format/color 单测；其余为 typed hook contract |
| PWA/Electron | 不进入静态 Admin 主链 | `DEFER` | 三个 App 当前无运行时依赖；恢复前必须新增 ADR 和产品 owner |

A2.4 于 2026-07-14 以模板组件、工具 hooks、`/rich-reference` 中性验收页接受。Vditor 的 CDN/WYSIWYG 专项、ECharts option 全量兼容、Howler/Video.js 高级控制和远程 Iconify 被明确排除在模板基础包之外；它们不是三个现有 Admin 的生产依赖，若业务后续需要，必须按 adapter/ADR 单场景引入，不得把外部 CDN 或任意网络 SVG 带入默认主链。

### 2.5 A2.5 Production Gate 当前进展

| 门禁 | 实现/命令 | 结果 | 证据状态 |
| --- | --- | --- | --- |
| 生产配置静态门禁 | `pnpm verify:production`；CSP、安全头、Nginx fallback、Docker lint、`VITE_AUTH_MODE=demo` 负例 | `passed` | 本地通过；待固定 commit 证据归档 |
| 单元/组件/类型/静态检查 | `pnpm test`、`pnpm typecheck`、`pnpm lint` | 39 Vitest tests、typecheck、lint 全部通过 | 本地通过 |
| 浏览器与 reduced-motion | `pnpm test:e2e` | 7 Chromium tests passed；覆盖键盘焦点、移动 Drawer、富组件、登出和 reduced-motion | 本地通过 |
| base path | `BASE_PATH=/admin pnpm build` | 产物引用 `/admin/assets/*`；随后恢复普通 `/` 构建 | 本地通过 |
| Docker/Nginx | `mybuild/Dockerfile` 固定执行 typecheck/lint/test/build；运行层仅 Nginx | 候选镜像通过 `/health`、SPA、deep-link、未知 asset 404、CSP、`nginx -t`、无 Node；Harbor digest `sha256:44301ec3651cf822bb866db1253112634470463b92c05ecb3a52f2c7a0eb3278` | `ACCEPTED` |
| clean-room | 固定 `168ed144e419a5b4b01abc2224d345a8ccd9785a` 的全新目录重建 | 39 Vitest、verify:production、typecheck、lint、build、7 Playwright 全部通过 | `ACCEPTED` |
| KIND/严格 TLS | 固定 Harbor digest 的隔离 Deployment/Service/IngressRoute | 严格 CA、SNI、首页、deep-link、asset 404、安全头和无 Node runtime 全部通过；资源已清理 | `ACCEPTED` |

A2.5 实现提交：`tpl-admin-frontend@168ed144e419a5b4b01abc2224d345a8ccd9785a`；Harbor 镜像 digest：`sha256:44301ec3651cf822bb866db1253112634470463b92c05ecb3a52f2c7a0eb3278`。A2.5 与 P0-007A2 已接受，状态为 `TEMPLATE_MIGRATION_READY`；三个业务 Admin 仍须按 P0-007B 的 Info -> Knowledge -> Research 串行迁移，不得直接批量替换。

## 3. 通用组件能力

以下 Vue 目录中的生产相关能力均为 `MUST`；React 目标路径可以调整，但必须回填本矩阵。

| Vue 来源                                  | React 目标能力                   | 关键行为                                        | 状态   |
| ----------------------------------------- | -------------------------------- | ----------------------------------------------- | ------ |
| `el-admin-components/components/Avatar/*` | AvatarList/AvatarMenu            | 用户头像、菜单、键盘和权限动作                  | `ACCEPTED` |
| `components/Charts/*`                     | Chart adapter/components         | ECharts 数据、空/加载/错误、resize 和无障碍替代 | `ACCEPTED` |
| `components/Description/*`                | Description                      | label/value、响应式布局、空值和复制             | `ACCEPTED` |
| `components/Edtior/*`                     | Editor                           | 编辑、清理、错误和内容边界                      | `ACCEPTED` |
| `components/Form/*`                       | Form/FormItem/FormLayout/schema  | schema 表单、校验、字段错误、提交状态           | `ACCEPTED` |
| `components/Icon/*`                       | Icon registry/picker             | 本地图标、Iconify、网络图标安全策略             | `ACCEPTED` |
| `components/Layouts/*`                    | Header/HeaderTabs/Breadcrumb     | header、tabs、面包屑、导航状态                  | `ACCEPTED` |
| `components/Menu/*`                       | Menu/SubMenu/Dropdown            | active route、折叠、键盘、权限过滤              | `ACCEPTED` |
| `components/Notice/*`                     | Notice/Notification              | 读写状态、队列、空/错误和可访问性               | `ACCEPTED` |
| `components/Player/*`                     | Audio/Video player               | 媒体错误、暂停、权限和资源 URL 清理             | `ACCEPTED` |
| `components/Slide/*`                      | Progress/transition              | 进度、动画、reduced-motion                      | `ACCEPTED` |
| `components/Table/*`                      | Table/TableColumn/drag           | 列配置、分页、筛选、拖拽、服务端状态            | `ACCEPTED` |
| `components/Themes/*`                     | theme/locale/fullscreen settings | 主题、语言、全屏、配置持久化                    | `ACCEPTED` |
| `components/Transition/*`                 | transition primitives            | collapse/transition 的可访问性和 reduced-motion | `ACCEPTED` |

## 4. 指令、工具和状态语义

| Vue 来源                                                                                                              | React 目标                     | 要求                                                                 | 状态    |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------- | ------- |
| `el-admin-components/directives/modules/{copy,debounce,draggable,flash,longPress,scrollText,throttle,waterMarker}.ts` | hooks/components/utilities     | 逐项决定 React idiomatic 实现；禁止只因没有 Vue directive 就静默删除 | `ACCEPTED`  |
| `src/utils/{color,format,index}.ts`                                                                                   | `app/lib/rich-utils.ts`        | 颜色、格式、持续时间、错误和安全 URL 行为有单测                      | `ACCEPTED`  |
| `src/store/*`                                                                                                         | Query + UI store + local state | 明确 server state/UI state/form state 归属，禁止领域事实只存内存     | `ACCEPTED`  |
| `src/modules/pwa.ts`                                                                                                  | React PWA strategy             | 盘点三个 App 是否依赖；无依赖时形成 `DEFER` 或 `REMOVE` 决策         | `DEFER` |
| `electron/*`                                                                                                          | Electron strategy              | 盘点是否仍有产品需求；无需求不得带入静态 Admin 主链                  | `DEFER` |

## 5. 路由和示例页面

示例页不等于业务页面，但不得无记录地消失。每个页面必须标记为通用能力示例、生产页面迁移输入、延期或移除。

| Vue 来源                                                              | React 处置                                     | 状态   |
| --------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| `src/pages/index.vue`, `login.vue`, `menus/**`                         | `home.tsx`、`login.tsx`、navigation/app-shell | `ACCEPTED` |
| `src/pages/about.vue`                                                  | 非生产通用能力；不复制纯展示页，按 ADR-013 保留为 `DEFER` | `DEFER` |
| `src/pages/components/**`                                             | `/rich-reference` 通用组件验收页；不进入 App 业务                | `ACCEPTED` |
| `src/pages/directives/**`                                             | `/rich-reference` utility/behavior 验收；未采用能力需 ADR        | `ACCEPTED` |
| `src/pages/players/**`, `notice/**`, `table/**`, `form/**`, `icon/**` | 组件行为和错误状态在 CRUD/Rich reference 中验收                   | `ACCEPTED` |
| `mock/*`, `src/assets/images/headers/*`                               | 仅测试 fixture；不进入 React 模板生产产物      | `REMOVE` |

## 6. P0-007A2 退出条件

- [x] Vue 基线 commit 和完整 `git ls-files` 清单已归档。
- [x] 所有生产相关 `MUST` 行有 React target、行为说明、测试和 owner。
- [x] 每个 `DEFER/REMOVE` 行有理由、影响、后续任务和依赖审查。
- [x] React 组件/页面不携带 Info、Knowledge、Research 领域 DTO 或业务规则。
- [x] 模板从干净目录可重复 install、typecheck、lint、unit、component、Playwright、a11y、Docker 和 Nginx smoke。
- [x] 基础路由、权限、错误、加载/空/部分/拒绝/重试状态与 Vue 行为矩阵对齐。
- [x] 生成固定 template commit 和 `TEMPLATE_MIGRATION_READY` 证据；三个业务 Admin 原地替换必须继续按 P0-007B 串行执行。
