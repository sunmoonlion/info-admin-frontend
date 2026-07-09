#!/bin/bash

# Admin CSR runtime-only image build script.
# Use after running: pnpm type-check && pnpm build-only
# Usage: ./build-runtime-image.sh [--tag TAG]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"; }

BUILD_CONF="${SCRIPT_DIR}/build.conf"
if [ ! -f "$BUILD_CONF" ]; then
    log_error "构建配置文件不存在: $BUILD_CONF"
    exit 1
fi
log_info "加载构建配置: $BUILD_CONF"
source "$BUILD_CONF"
source "$SCRIPT_DIR/harbor-cluster.sh"
REGISTRY="$(resolve_k8s_images_registry)" || exit 1
export REGISTRY

ADMIN_CSR_IMAGE="${ADMIN_CSR_IMAGE:-info-admin-frontend}"
ADMIN_CSR_TAG="${ADMIN_CSR_TAG:-1.0.0}"
DOCKERFILE="${RUNTIME_DOCKERFILE:-Dockerfile.runtime-local}"

CONTAINER_RUNTIME="${CONTAINER_RUNTIME:-docker}"
if [[ "$CONTAINER_RUNTIME" == "sudo nerdctl" || "$CONTAINER_RUNTIME" == "nerdctl" ]]; then
    NERDCTL_NAMESPACE="${NERDCTL_NAMESPACE:-k8s.io}"
    RUNTIME_CMD="sudo nerdctl -n ${NERDCTL_NAMESPACE}"
    if ! command -v nerdctl &> /dev/null; then log_error "nerdctl 未安装"; exit 1; fi
else
    RUNTIME_CMD="docker"
    if ! command -v docker &> /dev/null; then log_error "docker 未安装"; exit 1; fi
fi

if [[ "${1:-}" == "--tag" && -n "${2:-}" ]]; then
    ADMIN_CSR_TAG="$2"
    log_info "使用自定义标签: $ADMIN_CSR_TAG"
fi

PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [[ ! -f "$PROJECT_ROOT/dist/index.html" ]]; then
    log_error "缺少 dist/index.html，请先运行: pnpm type-check && pnpm build-only"
    exit 1
fi

ensure_base_image() {
    local public_image="$1"
    local harbor_image="${REGISTRY}/${public_image}"
    log_info "检查基础镜像: ${harbor_image}"
    if $RUNTIME_CMD image inspect "${harbor_image}" > /dev/null 2>&1; then
        log_info "本地基础镜像已就绪: ${harbor_image}"
        return 0
    fi
    if $RUNTIME_CMD pull "${harbor_image}" > /dev/null 2>&1; then
        log_info "基础镜像已就绪: ${harbor_image}"
    else
        log_error "Harbor 中不存在基础镜像: ${harbor_image}"
        exit 1
    fi
}

log_info "Admin CSR runtime-only 镜像构建脚本启动"
ensure_base_image "nginx:stable-alpine"

cd "$PROJECT_ROOT"
$RUNTIME_CMD build -f "$SCRIPT_DIR/$DOCKERFILE" \
    -t "${ADMIN_CSR_IMAGE}:${ADMIN_CSR_TAG}" \
    --build-arg REGISTRY="${REGISTRY}" \
    .

log_success "镜像构建完成: ${ADMIN_CSR_IMAGE}:${ADMIN_CSR_TAG}"
