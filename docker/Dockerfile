# 多阶段构建 - Next.js前端应用
# 构建阶段
FROM node:18-alpine as builder

# 设置构建参数
ARG NODE_ENV=production
ARG BUILD_OPTIMIZATION=true
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MINIO_ENDPOINT
ARG NEXT_PUBLIC_WS_URL

# 设置环境变量
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# =============================================================================
# 运行环境
FROM node:18-alpine as runtime

# 安装运行时依赖
RUN apk add --no-cache \
    dumb-init \
    curl

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建结果
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制package.json用于健康检查
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# =============================================================================
# 开发环境
FROM node:18-alpine as development

# 设置环境变量
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# 安装开发依赖
RUN apk add --no-cache \
    curl \
    git

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装所有依赖 (包括devDependencies)
RUN npm install

# 复制源代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000 3001

# 开发环境健康检查 (宽松)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 开发环境启动命令 (热重载)
CMD ["npm", "run", "dev"]

# =============================================================================
# 多层优化构建 (生产环境推荐)
FROM node:18-alpine as production-optimized

# 设置构建参数
ARG NODE_ENV=production
ARG BUILD_OPTIMIZATION=true
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MINIO_ENDPOINT
ARG NEXT_PUBLIC_WS_URL

# 安装系统级缓存优化工具
RUN apk add --no-cache \
    dumb-init \
    curl \
    varnish \
    nginx

# 设置环境变量
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 缓存node_modules层
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# 复制源代码并构建
COPY . .
RUN npm run build

# 清理开发依赖
RUN rm -rf node_modules/.cache && \
    npm cache clean --force

# 复制构建结果
COPY --from=0 --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=0 --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=0 --chown=nextjs:nodejs /app/public ./public

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 优化健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# =============================================================================
# 标签和元数据
# =============================================================================

# 构建标签
LABEL maintainer="YOLO Annotation Platform Team" \
      version="1.0.0" \
      description="YOLO数据集标注平台 - Next.js前端服务" \
      node-env=${NODE_ENV} \
      build-optimization=${BUILD_OPTIMIZATION}

# 构建信息
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.version=$VERSION \
      org.label-schema.name="yolo-frontend" \
      org.label-schema.description="YOLO数据集标注平台前端服务" \
      org.label-schema.url="https://github.com/your-org/yolo-annotation-platform" \
      org.label-schema.vcs-url="https://github.com/your-org/yolo-annotation-platform" \
      org.label-schema.schema-version="1.0"

# =============================================================================
# 性能优化说明
# =============================================================================

# 1. 多阶段构建减少最终镜像大小
# 2. 使用非root用户提升安全性
# 3. 启用standalone模式优化部署
# 4. 缓存依赖层减少构建时间
# 5. 设置健康检查确保服务可用
# 6. 使用dumb-init处理信号

# =============================================================================
# 使用说明
# =============================================================================

# 构建生产镜像:
# docker build -t yolo-frontend:latest .

# 构建开发镜像:
# docker build --target development -t yolo-frontend:dev .

# 构建优化镜像:
# docker build --target production-optimized \
#   --build-arg NEXT_PUBLIC_API_URL=https://api.your-domain.com \
#   --build-arg NEXT_PUBLIC_MINIO_ENDPOINT=https://storage.your-domain.com \
#   -t yolo-frontend:optimized .

# 运行生产容器:
# docker run -p 3000:3000 yolo-frontend:latest

# 运行开发容器:
# docker run -p 3000:3000 -v $(pwd):/app yolo-frontend:dev

# 调试模式:
# docker run -p 3000:3000 -p 3001:3001 -v $(pwd):/app yolo-frontend:dev