# tpl-admin-frontend 镜像构建

## 架构

- **构建上下文**：子模块根目录（`tpl-admin-frontend/`）
- **构建方式**：多阶段构建（node:alpine 编译 → nginx:alpine 服务）
- **镜像名称**：`tpl-admin-frontend:1.0.0`（本地）；CI 使用 git SHA tag

## 文件说明

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 多阶段构建文件（本地 & CI 共用） |
| `nginx.conf` | 容器内 nginx SPA 配置 |
| `build.conf` | 本地构建配置（镜像名、仓库、REGISTRY 等） |
| `build-image.sh` | 本地构建（可选推送）脚本 |
| `push-image.sh` | 单独推送脚本 |
| `rebuild-and-run.sh` | 快速重建并本地运行 |

## 本地构建（黄金命令）

```bash
# 在子模块根目录执行
docker build -f mybuild/Dockerfile \
  --build-arg REGISTRY=harbor.sunmoonai.com:30443/k8s-images \
  --build-arg VITE_API_URL=http://localhost:8001 \
  -t tpl-admin-frontend:1.0.0 .
```

## 使用脚本构建

```bash
cd mybuild
./build-image.sh             # 构建
./build-image.sh --tag 1.0.1 # 自定义 tag
./push-image.sh              # 推送到 Harbor
./rebuild-and-run.sh         # 重建并本地运行（http://localhost:8080）
```

## CI（Kaniko）参数

```
--dockerfile    mybuild/Dockerfile
--context       <子模块根目录>
--build-arg     REGISTRY=harbor.sunmoonai.com:30443/k8s-images
--build-arg     VITE_API_URL=<环境 API 地址>
--destination   harbor.sunmoonai.com:30443/k8s-images/tpl-admin-frontend:<git-sha>
--destination   harbor.sunmoonai.com:30443/k8s-images/tpl-admin-frontend:latest
```

## 注意事项

- `VITE_API_URL` 构建时静态嵌入，不同环境须构建不同镜像
- 本地构建无需 Harbor 时传 `--build-arg REGISTRY=` 退回 DockerHub
