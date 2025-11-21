# 多阶段构建 - Next.js前端应用
# =============================================================================
# 构建阶段
# =============================================================================
FROM node:20-alpine as builder

# 设置构建参数
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_MINIO_ENDPOINT

# 设置环境变量
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，构建时需要）
RUN npm ci --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# =============================================================================
# 运行环境
# =============================================================================
FROM node:20-alpine as runtime

# 安装运行时依赖
RUN apk add --no-cache \
    dumb-init \
    curl

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 从构建阶段复制 standalone 输出（更小的镜像）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# 启动命令（使用 standalone 模式的 server.js）
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# =============================================================================
# 开发环境
# =============================================================================
FROM node:20-alpine as development

# 设置环境变量
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# 安装开发依赖
RUN apk add --no-cache \
    curl \
    git

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm install

# 复制源代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 开发环境启动命令（热重载）
CMD ["npm", "run", "dev"]

# =============================================================================
# 使用说明
# =============================================================================
# 构建生产镜像:
# docker build -t yolo-frontend:latest \
#   --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
#   .
#
# 构建开发镜像:
# docker build --target development -t yolo-frontend:dev .
#
# 运行生产容器:
# docker run -d -p 3000:3000 \
#   -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
#   --name yolo-frontend \
#   yolo-frontend:latest
#
# 运行开发容器:
# docker run -p 3000:3000 \
#   -v $(pwd):/app \
#   -v /app/node_modules \
#   -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
#   yolo-frontend:dev
