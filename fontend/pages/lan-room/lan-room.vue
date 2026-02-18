<template>
  <view class="container">
    <view v-if="!isInRoom" class="room-actions">
      <button class="btn btn-primary" @click="createRoom">创建房间</button>
      <button class="btn btn-secondary" @click="showJoinDialog = true">加入房间</button>
    </view>
    
    <view v-else class="room-info">
      <view class="room-header">
        <text class="room-title">房间号: {{ gameStore.roomCode }}</text>
        <text v-if="gameStore.isHost" class="host-badge">房主</text>
      </view>
      
      <view class="player-list">
        <view 
          v-for="player in gameStore.players" 
          :key="player.id"
          class="player-item"
        >
          <text class="player-name">{{ player.name }}</text>
          <text v-if="player.ready" class="ready-badge">已准备</text>
          <text v-else class="waiting-badge">等待中</text>
        </view>
      </view>
      
      <view v-if="gameStore.isHost" class="host-actions">
        <button class="btn btn-primary" @click="startGame">开始游戏</button>
      </view>
    </view>
    
    <!-- 加入房间对话框 -->
    <view v-if="showJoinDialog" class="dialog-mask" @click="showJoinDialog = false">
      <view class="dialog" @click.stop>
        <text class="dialog-title">输入房间号</text>
        <input 
          class="dialog-input"
          v-model="joinRoomCode"
          placeholder="请输入房间号"
          maxlength="6"
        />
        <view class="dialog-actions">
          <button class="dialog-btn" @click="showJoinDialog = false">取消</button>
          <button class="dialog-btn primary" @click="joinRoom">加入</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '@/store/game'
import { request, createSocket } from '@/utils/request'

const gameStore = useGameStore()
const isInRoom = ref(false)
const showJoinDialog = ref(false)
const joinRoomCode = ref('')

// 创建房间
const createRoom = async () => {
  try {
    const res = await request({
      url: '/api/room/create',
      method: 'POST',
      data: {
        mode: 'lan'
      }
    })
    
    gameStore.setRoomInfo(res.roomId, res.roomCode, true)
    isInRoom.value = true
    
    // 连接 WebSocket
    await connectSocket(res.roomId)
    
    uni.showToast({
      title: '房间创建成功',
      icon: 'success'
    })
  } catch (err) {
    uni.showToast({
      title: '创建房间失败',
      icon: 'none'
    })
  }
}

// 加入房间
const joinRoom = async () => {
  if (!joinRoomCode.value) {
    uni.showToast({
      title: '请输入房间号',
      icon: 'none'
    })
    return
  }
  
  try {
    const res = await request({
      url: '/api/room/join',
      method: 'POST',
      data: {
        roomCode: joinRoomCode.value,
        mode: 'lan'
      }
    })
    
    gameStore.setRoomInfo(res.roomId, res.roomCode, false)
    isInRoom.value = true
    showJoinDialog.value = false
    
    // 连接 WebSocket
    await connectSocket(res.roomId)
    
    uni.showToast({
      title: '加入房间成功',
      icon: 'success'
    })
  } catch (err) {
    uni.showToast({
      title: '加入房间失败',
      icon: 'none'
    })
  }
}

// 连接 WebSocket
const connectSocket = async (roomId) => {
  try {
    const wsUrl = `wss://your-backend-url.com/ws?roomId=${roomId}` // 替换为实际地址
    const socket = await createSocket(wsUrl)
    
    socket.onMessage((res) => {
      try {
        const data = JSON.parse(res.data)
        handleSocketMessage(data)
      } catch (err) {
        console.error('解析消息失败', err)
      }
    })
    
    gameStore.socket = socket
    
    // 连接成功后发送加入房间消息
    socket.onOpen(() => {
      socket.send({
        data: JSON.stringify({
          type: 'join_room',
          playerName: `玩家${gameStore.players.findIndex(p => p.name === '') + 1 || 1}`
        })
      })
    })
  } catch (err) {
    console.error('WebSocket 连接失败', err)
    uni.showToast({
      title: '连接失败，请检查网络',
      icon: 'none'
    })
  }
}

// 处理 WebSocket 消息
const handleSocketMessage = (data) => {
  switch (data.type) {
    case 'player_joined':
      // 更新玩家列表
      if (data.players) {
        data.players.forEach((p, index) => {
          if (gameStore.players[index]) {
            gameStore.players[index].name = p.name
            gameStore.players[index].ready = p.ready || false
          }
        })
      }
      break
    case 'player_left':
      // 移除玩家
      if (data.players) {
        data.players.forEach((p, index) => {
          if (gameStore.players[index]) {
            gameStore.players[index].name = p.name
            gameStore.players[index].ready = p.ready || false
          } else {
            gameStore.players[index] = {
              id: index + 1,
              name: '',
              score: 0,
              ready: false
            }
          }
        })
      }
      break
    case 'game_started':
      // 开始游戏
      uni.navigateTo({
        url: '/pages/game/game'
      })
      break
    case 'error':
      uni.showToast({
        title: data.message || '操作失败',
        icon: 'none'
      })
      break
  }
}

// 开始游戏
const startGame = () => {
  if (gameStore.socket) {
    gameStore.socket.send({
      data: JSON.stringify({
        type: 'start_game',
        roomId: gameStore.roomId
      })
    })
  } else {
    uni.showToast({
      title: '连接未建立',
      icon: 'none'
    })
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F8F8F8;
  padding: 32rpx;
}

.room-actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 100rpx;
}

.btn {
  border-radius: 24rpx;
  padding: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  color: white;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.3);
}

.btn-secondary {
  background: white;
  color: #FF6B9D;
  border: 2rpx solid #FF6B9D;
}

.room-info {
  margin-top: 40rpx;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.room-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.host-badge {
  background: #FF6B9D;
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.player-item {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-name {
  font-size: 32rpx;
  color: #333;
}

.ready-badge {
  color: #4CAF50;
  font-size: 24rpx;
}

.waiting-badge {
  color: #999;
  font-size: 24rpx;
}

.host-actions {
  margin-top: 32rpx;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 24rpx;
  padding: 48rpx;
  width: 600rpx;
}

.dialog-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 32rpx;
  text-align: center;
}

.dialog-input {
  width: 100%;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 32rpx;
  margin-bottom: 32rpx;
}

.dialog-actions {
  display: flex;
  gap: 24rpx;
}

.dialog-btn {
  flex: 1;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  background: #F5F5F5;
  color: #666;
  border: none;
}

.dialog-btn.primary {
  background: #FF6B9D;
  color: white;
}
</style>
