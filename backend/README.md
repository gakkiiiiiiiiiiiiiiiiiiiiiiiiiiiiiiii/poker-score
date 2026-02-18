# 锄大地计分后端服务

## 安装依赖

```bash
npm install
```

## 运行

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## 部署到微信云托管

1. 在微信云托管控制台创建服务
2. 配置环境变量（如需要）
3. 上传代码并部署

## API 接口

### 创建房间
POST `/api/room/create`
Body: `{ "mode": "online" | "lan" }`
Response: `{ "success": true, "roomId": "...", "roomCode": "..." }`

### 加入房间
POST `/api/room/join`
Body: `{ "roomCode": "123456", "mode": "online" | "lan" }`
Response: `{ "success": true, "roomId": "...", "roomCode": "..." }`

### 获取房间信息
GET `/api/room/:roomId`
Response: `{ "success": true, "room": {...} }`

## WebSocket 消息

### 客户端发送

1. `join_room`: 加入房间
   ```json
   { "type": "join_room", "playerName": "玩家1" }
   ```

2. `start_game`: 开始游戏（仅房主）
   ```json
   { "type": "start_game", "roomId": "..." }
   ```

3. `submit_cards`: 提交牌数
   ```json
   { "type": "submit_cards", "roomId": "...", "cards": 10 }
   ```

4. `settle_round`: 结算本局（仅房主）
   ```json
   { "type": "settle_round", "roomId": "..." }
   ```

### 服务端发送

1. `connected`: 连接成功
2. `player_joined`: 玩家加入
3. `player_left`: 玩家离开
4. `game_started`: 游戏开始
5. `cards_submitted`: 牌数已提交
6. `all_ready`: 所有玩家已准备
7. `round_settled`: 本局已结算
8. `error`: 错误消息
