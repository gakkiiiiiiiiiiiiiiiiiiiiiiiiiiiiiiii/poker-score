# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖（生产依赖）
RUN npm ci --only=production && npm cache clean --force

# 生产阶段
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 创建非 root 用户（安全最佳实践）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 从构建阶段复制 node_modules
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# 复制应用代码
COPY --chown=nodejs:nodejs . .

# 切换到非 root 用户
USER nodejs

# 暴露端口（微信云托管会通过环境变量 PORT 指定端口，默认 80）
EXPOSE 80

# 健康检查（微信云托管会自动注入 PORT 环境变量）
# 检查 /health 端点，每 30 秒检查一次，超时 3 秒，启动后等待 10 秒开始检查，失败 3 次后标记为不健康
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 80) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# 启动应用
CMD ["node", "server.js"]
