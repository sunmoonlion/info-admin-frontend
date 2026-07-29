# tpl-admin-frontend 镜像构建

该目录构建 Next.js Admin standalone 镜像。源码位于仓库根目录 `app/`，运行镜像只
包含精确 Node LTS 基础镜像与 standalone 产物，不使用 Nginx 承载。

## 构建

```bash
cd /home/zymun/tpl-app/tpl-admin-frontend
docker build \
  --progress=plain \
  -f mybuild/Dockerfile \
  -t tpl-admin-frontend:1.0.0 \
  .
```

也可以使用配置化脚本：

```bash
cd /home/zymun/tpl-app/tpl-admin-frontend/mybuild
./build-image.sh --tag 1.0.0
```

`build.conf` 的主要配置：

- `TPL_SSR_IMAGE`：默认 `tpl-admin-frontend`
- `TPL_SSR_TAG`：镜像标签
- `TPL_SSR_IMAGE_REGISTRY` / `TPL_SSR_IMAGE_PROJECT`：Harbor 目标
- `PUSH_IMAGES_AFTER_BUILD`：是否在构建后推送
- `CONTAINER_RUNTIME`：`docker` 或 `nerdctl`

## 运行时契约

浏览器只访问同源 `/api`。容器必须在运行时提供：

- `DEPLOYMENT_ENV`
- `AUTH_APP`
- `APP_ORIGIN`
- `ADMIN_BACKEND_INTERNAL_URL`
- `DEPLOYMENT_ID`

禁止把 Casdoor secret、Redis 凭据或服务 token 作为 `NEXT_PUBLIC_*` 或 Docker
构建参数写入 bundle。构建时使用的本地默认值只用于可复现构建，生产 Pod 启动时
会由环境校验拒绝缺失或不安全的配置。

## 发布门禁

镜像只有在 typecheck、lint、i18n、unit/component、Next production build、
受控配对 E2E、Docker smoke、KIND 严格 TLS 和前后端兼容/回滚矩阵全部通过后，
才允许固化正式标签。
