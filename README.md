# 锄大地扑克牌计分微信小程序

一个支持多种计分模式的锄大地扑克牌计分小程序，包含前端（uniapp）和后端（Express + WebSocket）。

## 功能特性

1. **统一计分模式**：单个用户统计所有玩家的牌数
2. **局域网计分模式**：创建房间并邀请局域网内的玩家加入，每个玩家输入自己的牌数
3. **联网计分模式**：创建房间，其他玩家输入房间号加入，每个玩家输入自己的牌数
4. **多局游戏管理**：支持多局游戏，每局结算后自动计算得分
5. **实时同步**：使用 WebSocket 实现多人实时同步

## 项目结构

```
poker-score/
├── fontend/          # 前端 uniapp 项目
│   ├── pages/       # 页面
│   ├── store/       # 状态管理
│   └── utils/       # 工具函数
├── backend/         # 后端 Express 服务
│   └── server.js    # 服务器主文件
└── design-assets/   # 设计稿资源
```

## 快速开始

### 前端

```bash
cd fontend
npm install
npm run dev:mp-weixin
```

在微信开发者工具中导入项目，AppID: `wx7ac602cfa2edad40`

### 后端

```bash
cd backend
npm install
npm run dev
```

默认运行在 `http://localhost:3000`

## 部署

### 前端部署

1. 使用 HBuilderX 或 uni-app CLI 构建小程序
2. 在微信开发者工具中上传代码
3. 提交审核并发布

### 后端部署

1. 在微信云托管控制台创建服务
2. 配置环境变量（如需要）
3. 上传代码并部署
4. 更新前端 `utils/request.js` 中的 `BASE_URL` 为实际的后端地址

## 技术栈

- **前端**：uniapp + Vue 3 + Pinia
- **后端**：Express.js + WebSocket (ws)
- **部署**：微信小程序 + 微信云托管

## 得分计算规则

每局游戏结束后，根据以下公式计算每个玩家的得分：

- 玩家1得分 = (玩家2-玩家1) + (玩家3-玩家1) + (玩家4-玩家1)
- 玩家2得分 = (玩家1-玩家2) + (玩家3-玩家2) + (玩家4-玩家2)
- 玩家3得分 = (玩家1-玩家3) + (玩家2-玩家3) + (玩家4-玩家3)
- 玩家4得分 = (玩家1-玩家4) + (玩家2-玩家4) + (玩家3-玩家4)

## 设计稿

设计稿资源位于 `design-assets/` 目录，包含：
- Round Results (Macaron)
- Home Screen (Macaron)
- Score Entry with Settlement Confirmation
- Multiplayer Lobby Icons Fixed

## 许可证

MIT
