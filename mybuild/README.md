# info-admin-frontend 镜像构建

## 架构

- **构建上下文**：子模块根目录（`info-admin-frontend/`）
- **构建方式**：多阶段构建（node:alpine 编译 → nginx:alpine 服务）
- **镜像名称**：`info-admin-frontend:1.0.0`（本地）；CI 使用 git SHA tag

## 文件说明

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 多阶段构建文件（本地 & CI 共用） |
| `Dockerfile.runtime-local` | 仅打包本机已生成 `dist` 的 nginx 运行镜像 |
| `nginx.conf` | 容器内 nginx SPA 配置 |
| `build.conf` | 本地构建配置（镜像名、仓库、REGISTRY 等） |
| `build-image.sh` | 本地构建（可选推送）脚本 |
| `build-runtime-image.sh` | 使用已有 `dist` 构建运行镜像 |
| `push-image.sh` | 单独推送脚本 |
| `rebuild-and-run.sh` | 快速重建并本地运行 |

## 本地构建（黄金命令）

```bash
# 在子模块根目录执行
docker build -f mybuild/Dockerfile \
  --build-arg REGISTRY=harbor.sunmoonai.com:30443/k8s-images \
  --build-arg VITE_API_URL=http://localhost:8001 \
  -t info-admin-frontend:1.0.0 .
```

## 使用脚本构建

```bash
cd mybuild
./build-image.sh             # 构建
./build-image.sh --tag 1.0.1 # 自定义 tag
./push-image.sh              # 推送到 Harbor
./rebuild-and-run.sh         # 重建并本地运行（http://localhost:8080）
```

## Runtime-only 构建

当本机已经完成前端验证，但 Docker build 内部访问 npm registry 不稳定时，可以先在项目根目录生成 `dist`，再只打包 nginx 运行镜像：

```bash
pnpm type-check
pnpm build-only

cd mybuild
./build-runtime-image.sh --tag 1.0.1
./push-image.sh --tag 1.0.1
```

该路径不会在 Docker 内重新执行 `pnpm install` 或 `pnpm build`，因此必须先确保本机 `dist/index.html` 来自已通过验证的构建。

## CI（Kaniko）参数

```
--dockerfile    mybuild/Dockerfile
--context       <子模块根目录>
--build-arg     REGISTRY=harbor.sunmoonai.com:30443/k8s-images
--build-arg     VITE_API_URL=<环境 API 地址>
--destination   harbor.sunmoonai.com:30443/k8s-images/info-admin-frontend:<git-sha>
--destination   harbor.sunmoonai.com:30443/k8s-images/info-admin-frontend:latest
```

## 注意事项

- `VITE_API_URL` 构建时静态嵌入，不同环境须构建不同镜像
- 本地构建无需 Harbor 时传 `--build-arg REGISTRY=` 退回 DockerHub
