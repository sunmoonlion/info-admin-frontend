# Next Admin 数据流与状态所有权

```text
Request cookie -> Server-only DAL -> FastAPI Admin Backend -> BrowserSession DTO
Server Layout -> role-filtered navigation metadata -> Client AppShell
Page -> typed same-origin client -> FastAPI Admin API -> domain truth
Page <-> TanStack Query server-state cache
Page <-> form/local interaction state
AppShell <-> Zustand UI-only preferences
```

- FastAPI Admin Backend 持有 provider exchange、opaque session、授权和领域事实。
- Next Server Component/DAL 只转发请求 cookie/correlation ID，并严格解析安全 DTO。
- 浏览器只访问同源 `/api`，不保存 provider/service token。
- TanStack Query 管理服务端资源缓存；身份切换和 logout 清空授权缓存。
- Zustand 只保存主题、密度、侧栏和已打开标签；标签每次按当前角色菜单对账。
- URL `searchParams` 持有可分享的分页、排序和筛选；表单草稿留在表单组件。
- 菜单角色过滤是体验层，直接 URL 必须再次经过 Server 授权，后端仍是最终授权点。
