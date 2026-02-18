# 故障排查指南

## 常见问题

### 1. 健康检查失败：connection refused

**错误信息：**
```
Liveness probe failed: dial tcp 10.21.7.134:80: connect: connection refused
Readiness probe failed: dial tcp 10.21.7.134:80: connect: connection refused
```

**可能原因：**
1. 应用未正确启动
2. 应用监听的端口与健康检查端口不匹配
3. 应用启动时间过长，健康检查在应用启动前就开始检查

**解决方案：**

#### 方案 1：检查应用日志
查看应用启动日志，确认：
- 应用是否成功启动
- 监听的端口是否正确
- 是否有错误信息

#### 方案 2：增加启动等待时间
如果应用启动较慢，可以增加健康检查的 `start-period`：
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "..."
```

#### 方案 3：确认端口配置
确保：
- Dockerfile 中 `EXPOSE` 的端口与微信云托管配置一致
- 应用代码中 `PORT` 环境变量的默认值与微信云托管注入的值一致
- 健康检查使用的端口与应用监听的端口一致

### 2. 权限错误：EACCES

**错误信息：**
```
Error: listen EACCES: permission denied 0.0.0.0:80
```

**解决方案：**
- 使用 root 用户运行（当前 Dockerfile 已配置）
- 或使用非特权端口（>1024），如 8080

### 3. WebSocket 连接失败

**检查项：**
1. 确认使用 `wss://` 协议（生产环境）
2. 检查防火墙和安全组设置
3. 查看 WebSocket 路径配置是否正确
4. 确认 WebSocket 服务器已正确启动

### 4. 应用无法访问

**检查项：**
1. 确认服务已成功部署
2. 检查服务状态是否为"运行中"
3. 查看服务日志是否有错误
4. 确认域名/URL 配置正确

## 调试步骤

### 1. 查看日志
在微信云托管控制台查看服务日志，重点关注：
- 应用启动日志
- 错误信息
- 端口监听信息

### 2. 本地测试
使用 Docker 本地测试：
```bash
cd backend
docker build -t poker-score-backend .
docker run -p 3000:80 -e PORT=80 poker-score-backend
```

然后测试：
```bash
curl http://localhost:3000/health
```

### 3. 检查环境变量
确认微信云托管注入的环境变量：
- `PORT`: 应用监听的端口
- `HOST`: 应用绑定的主机（通常是 0.0.0.0）

### 4. 验证健康检查端点
确保 `/health` 端点返回 200 状态码：
```bash
curl http://your-service-url/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## 微信云托管特定配置

### 端口配置
- 微信云托管会自动注入 `PORT` 环境变量
- 默认端口通常是 80
- 应用必须监听该端口

### 健康检查
- 微信云托管会定期检查健康检查端点
- 默认检查 `/health` 路径
- 必须返回 200 状态码

### 日志查看
- 在微信云托管控制台查看实时日志
- 关注启动日志和错误日志
- 日志会显示应用监听的端口和启动状态

## 联系支持

如果问题仍未解决，请：
1. 收集完整的错误日志
2. 记录复现步骤
3. 联系微信云托管技术支持
