ARG NODE_VERSION=18.20.0
# Docker 镜像仓库；CI 传 Harbor 地址，本地默认同 Harbor（内网可用）；纯外网传 --build-arg REGISTRY= 退回 DockerHub
ARG REGISTRY=harbor.sunmoonai.com:30443/k8s-images
ARG NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM ${REGISTRY}/node:${NODE_VERSION}-alpine AS build

# 代理配置（可选）
ARG NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
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
    no_proxy=${no_proxy} \
    npm_config_registry=${NPM_CONFIG_REGISTRY} \
    COREPACK_NPM_REGISTRY=${NPM_CONFIG_REGISTRY} \
    COREPACK_INTEGRITY_KEYS=0 \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000

# VITE_* 构建时静态嵌入 bundle，CI 通过 --build-arg 注入
ARG VITE_API_URL
ARG VITE_MOCK_ENABLE=false
ARG VITE_PWA_DEBUG=false
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_MOCK_ENABLE=${VITE_MOCK_ENABLE} \
    VITE_PWA_DEBUG=${VITE_PWA_DEBUG}

RUN npm install -g pnpm@9.15.4 \
    --registry="${NPM_CONFIG_REGISTRY}" \
    --fetch-retries=5 \
    --fetch-retry-maxtimeout=120000 \
    --fetch-timeout=600000

ENV CYPRESS_INSTALL_BINARY=0 \
    ELECTRON_SKIP_BINARY_DOWNLOAD=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true

WORKDIR /app

# 先复制依赖文件和本地 workspace 包，利用层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY el-admin-components/ ./el-admin-components/
RUN --mount=type=cache,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile --network-concurrency=3

# 复制全部源码（构建上下文为子模块根目录）
COPY . .

RUN pnpm run build

# ============================================================================
# Stage 2: Serve
# ============================================================================
ARG REGISTRY=harbor.sunmoonai.com:30443/k8s-images
FROM ${REGISTRY}/nginx:stable-alpine AS run

COPY --from=build /app/dist /usr/share/nginx/html
COPY mybuild/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
