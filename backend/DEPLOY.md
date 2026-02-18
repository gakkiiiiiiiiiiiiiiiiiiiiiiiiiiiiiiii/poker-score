# 微信云托管部署指南

## 前置要求

1. 已开通微信云托管服务
2. 已安装微信开发者工具或使用网页版控制台
3. 已准备好代码仓库（GitHub、GitLab 或微信云托管代码仓库）

## 部署步骤

### 方式一：通过微信云托管控制台部署

1. **登录微信云托管控制台**
   - 访问 https://cloudbase.net/
   - 选择对应的环境

2. **创建服务**
   - 点击「服务管理」->「新建服务」
   - 服务名称：`poker-score-backend`
   - 选择「Dockerfile 构建」

3. **配置构建信息**
   - 代码来源：选择代码仓库或上传代码包
   - Dockerfile 路径：`backend/Dockerfile`
   - 构建目录：`backend/`
   - 端口：`8080`（微信云托管会自动注入 PORT 环境变量，使用非特权端口避免权限问题）

4. **配置环境变量（可选）**
   ```
   NODE_ENV=production
   ```

5. **开始部署**
   - 点击「开始部署」
   - 等待构建和部署完成

### 方式二：通过命令行部署（使用 CloudBase CLI）

1. **安装 CloudBase CLI**
   ```bash
   npm install -g @cloudbase/cli
   ```

2. **登录**
   ```bash
   tcb login
   ```

3. **初始化项目**
   ```bash
   cd backend
   tcb init
   ```

4. **部署**
   ```bash
   tcb framework deploy
   ```

### 方式三：使用 Docker 本地构建测试

1. **构建镜像**
   ```bash
   cd backend
   docker build -t poker-score-backend .
   ```

2. **运行容器**
   ```bash
   docker run -p 80:80 -e PORT=80 poker-score-backend
   ```

3. **测试健康检查**
   ```bash
   curl http://localhost/health
   ```

## 配置说明

### 端口配置

微信云托管会自动注入 `PORT` 环境变量，应用需要监听该端口。代码中已配置：
```javascript
const PORT = process.env.PORT || 80;
```

### 健康检查

Dockerfile 中配置了健康检查端点 `/health`，微信云托管会定期检查服务状态。

### WebSocket 支持

微信云托管支持 WebSocket，确保：
1. WebSocket 路径正确配置
2. 前端使用 `wss://` 协议连接（生产环境）

## 更新前端配置

部署完成后，需要更新前端的 API 地址：

1. **修改 `fontend/utils/request.js`**
   ```javascript
   const BASE_URL = 'https://your-service-id.xxx.app' // 替换为实际的服务地址
   ```

2. **修改 WebSocket 地址**
   ```javascript
   const wsUrl = `wss://your-service-id.xxx.app/ws?roomId=${roomId}`
   ```

## 监控和日志

- 在微信云托管控制台查看服务日志
- 监控服务运行状态和资源使用情况
- 设置告警规则

## 常见问题

### 1. 构建失败
- 检查 Dockerfile 语法
- 确认 package.json 依赖正确
- 查看构建日志

### 2. 服务无法启动
- 检查端口配置
- 查看服务日志
- 确认环境变量设置正确

### 3. WebSocket 连接失败
- 确认使用 `wss://` 协议
- 检查防火墙和安全组设置
- 查看 WebSocket 路径配置

### 4. 端口权限错误（EACCES）
如果遇到 `permission denied` 错误：
- **方案一（推荐）**：使用默认的 Dockerfile，它使用非特权端口 8080
- **方案二**：如果必须使用 80 端口，使用 `Dockerfile.root`（使用 root 用户）
- 微信云托管会自动通过环境变量 PORT 映射端口，无需担心端口冲突

## 参考文档

- [微信云托管文档](https://cloud.tencent.com/document/product/876)
- [Docker 官方文档](https://docs.docker.com/)
