# 管理端前端（info-admin-frontend）— Claude Code 规则

> 进入本目录时自动叠加，补充根目录 CLAUDE.md 的全局规则。

## 技术栈

- Vue 3 + Vite + TypeScript
- Element Plus（UI 组件库）
- Pinia（状态管理）
- axios（请求封装）
- CSR 模式（纯客户端渲染）
- 登录跳转到后端 BFF（`VITE_API_URL/auth/login`），由 `info-admin-backend` 负责 OIDC 对接

## 关键约定

**无内置 BFF**：管理端是纯 CSR，不含服务端路由；登录由对应后端（`info-admin-backend`）负责 Casdoor 对接，前端只做跳转。

**请求封装**：统一走 axios 实例，禁止页面内裸调；401 时跳转登录。

**字段对齐**：字段名、状态码以后端及 `API_CONTRACT.md` 为准。

**字段容错**：空值/可选字段做兜底，避免白屏。

**四态覆盖**：列表/表单页覆盖 loading / error / empty / success。

**依赖控制**：不随意升级 Vue / Element Plus / Vite，升级需单独任务。

## 目录结构速查

```
src/
├── pages/
│   └── login.vue             # 登录页（点击跳转 VITE_API_URL/auth/login）
├── router/                   # Vue Router（含登录守卫）
├── store/                    # Pinia store（auth 等）
├── api/                      # axios 封装与接口函数
└── components/               # 公共组件
```

## 开始一个页面前

1. 读 `info-admin-backend` 对应路由，确认接口参数与响应结构
2. 更新 `docs-claude/API_CONTRACT.md`（或等价文档）
3. 确认页面权限要求（哪些路由需要登录守卫）
