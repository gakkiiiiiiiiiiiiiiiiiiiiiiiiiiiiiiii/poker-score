const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// 启用 CORS
app.use(cors());
app.use(express.json());

// 健康检查端点（用于 Docker 健康检查和微信云托管）
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		timestamp: Date.now()
	});
});

// 根路径
app.get('/', (req, res) => {
	res.json({
		message: '锄大地计分后端服务',
		version: '1.0.0'
	});
});

// 房间存储
const rooms = new Map();
// WebSocket 连接存储
const connections = new Map();

// 生成6位房间号
const generateRoomCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// 创建房间
app.post('/api/room/create', (req, res) => {
	const { mode } = req.body;
	const roomId = uuidv4();
	const roomCode = generateRoomCode();

	const room = {
		id: roomId,
		code: roomCode,
		mode: mode || 'online',
		players: [],
		host: null,
		gameStarted: false,
		currentRound: 0,
		rounds: [],
	};

	rooms.set(roomId, room);

	res.json({
		success: true,
		roomId,
		roomCode,
	});
});

// 加入房间
app.post('/api/room/join', (req, res) => {
	const { roomCode, mode } = req.body;

	// 查找房间
	let room = null;
	for (const [id, r] of rooms.entries()) {
		if (r.code === roomCode && r.mode === mode) {
			room = r;
			break;
		}
	}

	if (!room) {
		return res.status(404).json({
			success: false,
			message: '房间不存在',
		});
	}

	if (room.gameStarted) {
		return res.status(400).json({
			success: false,
			message: '游戏已开始，无法加入',
		});
	}

	if (room.players.length >= 4) {
		return res.status(400).json({
			success: false,
			message: '房间已满',
		});
	}

	res.json({
		success: true,
		roomId: room.id,
		roomCode: room.code,
	});
});

// 获取房间信息
app.get('/api/room/:roomId', (req, res) => {
	const { roomId } = req.params;
	const room = rooms.get(roomId);

	if (!room) {
		return res.status(404).json({
			success: false,
			message: '房间不存在',
		});
	}

	res.json({
		success: true,
		room: {
			id: room.id,
			code: room.code,
			mode: room.mode,
			players: room.players,
			gameStarted: room.gameStarted,
			currentRound: room.currentRound,
		},
	});
});

// WebSocket 服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const roomId = url.searchParams.get('roomId');

	if (!roomId) {
		ws.close(1008, '缺少房间ID');
		return;
	}

	const room = rooms.get(roomId);
	if (!room) {
		ws.close(1008, '房间不存在');
		return;
	}

	// 存储连接
	const connectionId = uuidv4();
	connections.set(connectionId, {
		ws,
		roomId,
		playerId: null,
	});

	ws.on('message', (message) => {
		try {
			const data = JSON.parse(message.toString());
			handleMessage(connectionId, data);
		} catch (err) {
			console.error('解析消息失败:', err);
		}
	});

	ws.on('close', () => {
		handleDisconnect(connectionId);
	});

	// 发送连接成功消息
	ws.send(
		JSON.stringify({
			type: 'connected',
			connectionId,
		}),
	);
});

// 处理消息
const handleMessage = (connectionId, data) => {
	const connection = connections.get(connectionId);
	if (!connection) return;

	const { ws, roomId } = connection;
	const room = rooms.get(roomId);
	if (!room) return;

	switch (data.type) {
		case 'join_room':
			handleJoinRoom(connectionId, data, room);
			break;
		case 'start_game':
			handleStartGame(connectionId, data, room);
			break;
		case 'submit_cards':
			handleSubmitCards(connectionId, data, room);
			break;
		case 'settle_round':
			handleSettleRound(connectionId, data, room);
			break;
	}
};

// 处理加入房间
const handleJoinRoom = (connectionId, data, room) => {
	const connection = connections.get(connectionId);
	const { playerName } = data;

	if (room.players.length >= 4) {
		connection.ws.send(
			JSON.stringify({
				type: 'error',
				message: '房间已满',
			}),
		);
		return;
	}

	const playerId = room.players.length + 1;
	const player = {
		id: playerId,
		name: playerName || `玩家${playerId}`,
		connectionId,
		ready: false,
		currentRoundCards: null,
	};

	room.players.push(player);
	connection.playerId = playerId;

	// 如果是第一个玩家，设为房主
	if (room.players.length === 1) {
		room.host = playerId;
	}

	// 广播玩家加入消息
	broadcastToRoom(room.id, {
		type: 'player_joined',
		player: {
			id: player.id,
			name: player.name,
		},
		players: room.players.map((p) => ({
			id: p.id,
			name: p.name,
			ready: p.ready,
		})),
	});
};

// 处理开始游戏
const handleStartGame = (connectionId, data, room) => {
	const connection = connections.get(connectionId);

	// 检查是否是房主
	if (connection.playerId !== room.host) {
		connection.ws.send(
			JSON.stringify({
				type: 'error',
				message: '只有房主可以开始游戏',
			}),
		);
		return;
	}

	if (room.players.length < 2) {
		connection.ws.send(
			JSON.stringify({
				type: 'error',
				message: '至少需要2名玩家',
			}),
		);
		return;
	}

	room.gameStarted = true;
	room.currentRound = 1;

	// 广播游戏开始
	broadcastToRoom(room.id, {
		type: 'game_started',
		currentRound: room.currentRound,
	});
};

// 处理提交牌数
const handleSubmitCards = (connectionId, data, room) => {
	const connection = connections.get(connectionId);
	const player = room.players.find((p) => p.connectionId === connectionId);

	if (!player) return;

	player.currentRoundCards = data.cards;
	player.ready = true;

	// 检查是否所有玩家都已提交
	const allReady = room.players.every((p) => p.ready);

	// 广播提交状态
	broadcastToRoom(room.id, {
		type: 'cards_submitted',
		playerId: player.id,
		cards: data.cards,
		allReady,
		players: room.players.map((p) => ({
			id: p.id,
			name: p.name,
			ready: p.ready,
			currentRoundCards: p.currentRoundCards,
		})),
	});

	// 如果所有人都已提交，可以结算
	if (allReady) {
		broadcastToRoom(room.id, {
			type: 'all_ready',
			message: '所有玩家已提交，可以结算本局',
		});
	}
};

// 处理结算本局
const handleSettleRound = (connectionId, data, room) => {
	const connection = connections.get(connectionId);

	// 检查是否是房主
	if (connection.playerId !== room.host) {
		connection.ws.send(
			JSON.stringify({
				type: 'error',
				message: '只有房主可以结算',
			}),
		);
		return;
	}

	// 检查是否所有玩家都已提交
	const allReady = room.players.every((p) => p.ready);
	if (!allReady) {
		connection.ws.send(
			JSON.stringify({
				type: 'error',
				message: '还有玩家未提交牌数',
			}),
		);
		return;
	}

	// 收集所有玩家的牌数
	const cards = {};
	room.players.forEach((player) => {
		cards[`player${player.id}`] = player.currentRoundCards || 0;
	});

	// 计算得分
	const scores = calculateScores(cards);

	// 保存本局记录
	const round = {
		round: room.currentRound,
		cards,
		scores,
		timestamp: Date.now(),
	};
	room.rounds.push(round);

	// 更新玩家总分
	room.players.forEach((player, index) => {
		player.score = (player.score || 0) + scores[index];
	});

	// 重置准备状态
	room.players.forEach((player) => {
		player.ready = false;
		player.currentRoundCards = null;
	});

	room.currentRound++;

	// 广播结算结果
	broadcastToRoom(room.id, {
		type: 'round_settled',
		round: round.round,
		cards,
		scores,
		totalScores: room.players.map((p) => ({
			id: p.id,
			name: p.name,
			score: p.score || 0,
		})),
		currentRound: room.currentRound,
	});
};

// 计算得分
const calculateScores = (cards) => {
	const { player1, player2, player3, player4 } = cards;

	const scores = [
		player2 - player1 + (player3 - player1) + (player4 - player1), // 玩家1
		player1 - player2 + (player3 - player2) + (player4 - player2), // 玩家2
		player1 - player3 + (player2 - player3) + (player4 - player3), // 玩家3
		player1 - player4 + (player2 - player4) + (player3 - player4), // 玩家4
	];

	return scores;
};

// 处理断开连接
const handleDisconnect = (connectionId) => {
	const connection = connections.get(connectionId);
	if (!connection) return;

	const { roomId, playerId } = connection;
	const room = rooms.get(roomId);

	if (room && playerId) {
		// 移除玩家
		const index = room.players.findIndex((p) => p.connectionId === connectionId);
		if (index !== -1) {
			room.players.splice(index, 1);

			// 广播玩家离开
			broadcastToRoom(roomId, {
				type: 'player_left',
				playerId,
				players: room.players.map((p) => ({
					id: p.id,
					name: p.name,
					ready: p.ready,
				})),
			});
		}
	}

	connections.delete(connectionId);
};

// 广播消息到房间所有玩家
const broadcastToRoom = (roomId, message) => {
	const room = rooms.get(roomId);
	if (!room) return;

	room.players.forEach((player) => {
		const connection = Array.from(connections.values()).find((c) => c.connectionId === player.connectionId);

		if (connection && connection.ws.readyState === WebSocket.OPEN) {
			connection.ws.send(JSON.stringify(message));
		}
	});
};

// 清理过期房间（30分钟无活动）
setInterval(
	() => {
		const now = Date.now();
		for (const [id, room] of rooms.entries()) {
			const lastActivity = room.lastActivity || now;
			if (now - lastActivity > 30 * 60 * 1000) {
				rooms.delete(id);
				console.log(`房间 ${room.code} 已过期，已清理`);
			}
		}
	},
	5 * 60 * 1000,
); // 每5分钟检查一次

// 微信云托管使用环境变量 PORT，默认 8080（非特权端口）
// 微信云托管会自动注入 PORT 环境变量，无需担心端口冲突
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
	console.log(`服务器运行在 ${HOST}:${PORT}`);
});
