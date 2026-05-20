ARG NODE_VERSION=18.20.0
# Docker 镜像仓库；CI 传 Harbor 地址，本地默认同 Harbor（内网可用）；纯外网传 --build-arg REGISTRY= 退回 DockerHub
ARG REGISTRY=harbor.sunmoonai.com/k8s-images

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM ${REGISTRY}/node:${NODE_VERSION}-alpine AS build

# 代理配置（可选）
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG http_proxy
ARG https_proxy
ARG NO_PROXY
ARG no_proxy
ENV HTTP_PROXY=${HTTP_PROXY} \
    HTTPS_PROXY=${HTTPS_PROXY} \
    http_proxy=${http_proxy} \
    https_proxy=${https_proxy} \
    NO_PROXY=${NO_PROXY} \
    no_proxy=${no_proxy}

# VITE_* 构建时静态嵌入 bundle，CI 通过 --build-arg 注入
ARG VITE_API_URL
ARG VITE_MOCK_ENABLE=false
ARG VITE_PWA_DEBUG=false
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_MOCK_ENABLE=${VITE_MOCK_ENABLE} \
    VITE_PWA_DEBUG=${VITE_PWA_DEBUG}

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# 先复制依赖文件和本地 workspace 包，利用层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY el-admin-components/ ./el-admin-components/
RUN pnpm install --frozen-lockfile

# 复制全部源码（构建上下文为子模块根目录）
COPY . .

RUN pnpm run build

# ============================================================================
# Stage 2: Serve
# ============================================================================
ARG REGISTRY=harbor.sunmoonai.com/k8s-images
FROM ${REGISTRY}/nginx:stable-alpine AS run

COPY --from=build /app/dist /usr/share/nginx/html
COPY mybuild/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
