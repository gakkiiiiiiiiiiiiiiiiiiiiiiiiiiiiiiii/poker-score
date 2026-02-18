<template>
  <view class="container">
    <view class="round-header">
      <text class="round-text">第 {{ gameStore.currentRound + 1 }} 局</text>
    </view>
    
    <view class="player-list">
      <view 
        v-for="player in gameStore.players" 
        :key="player.id"
        class="player-card"
      >
        <view class="player-header">
          <text class="player-name">{{ player.name }}</text>
          <text class="player-total-score">总分: {{ player.score }}</text>
        </view>
        
        <view v-if="gameStore.gameMode === 'unified'" class="input-group">
          <text class="label">本局牌数:</text>
          <input 
            class="input"
            type="number"
            v-model.number="gameStore.currentRoundCards[`player${player.id}`]"
            placeholder="输入牌数"
          />
        </view>
        
        <view v-else class="score-display">
          <text class="score-label">本局牌数:</text>
          <text class="score-value">{{ player.currentRoundCards || '-' }}</text>
        </view>
      </view>
    </view>
    
    <view class="actions">
      <button 
        v-if="gameStore.gameMode === 'unified'"
        class="btn btn-secondary" 
        @click="settleRound"
      >
        结算本局
      </button>
      <button 
        v-else-if="!hasSubmitted"
        class="btn btn-primary" 
        @click="submitScore"
      >
        提交牌数
      </button>
      <button 
        v-else
        class="btn btn-disabled"
        disabled
      >
        已提交，等待其他玩家
      </button>
      
      <button class="btn btn-primary" @click="viewResults">查看结果</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/store/game'

const gameStore = useGameStore()
const hasSubmitted = ref(false)

// 监听 WebSocket 消息
onMounted(() => {
  if (gameStore.socket) {
    gameStore.socket.onMessage((res) => {
      try {
        const data = JSON.parse(res.data)
        handleSocketMessage(data)
      } catch (err) {
        console.error('解析消息失败', err)
      }
    })
  }
})

// 处理 WebSocket 消息
const handleSocketMessage = (data) => {
  switch (data.type) {
    case 'cards_submitted':
      // 更新玩家牌数显示
      if (data.players) {
        data.players.forEach((p, index) => {
          if (gameStore.players[index]) {
            gameStore.players[index].currentRoundCards = p.currentRoundCards
          }
        })
      }
      break
    case 'all_ready':
      uni.showToast({
        title: '所有玩家已提交',
        icon: 'success'
      })
      break
    case 'round_settled':
      // 更新得分
      if (data.totalScores) {
        data.totalScores.forEach((p, index) => {
          if (gameStore.players[index]) {
            gameStore.players[index].score = p.score
          }
        })
      }
      // 重置提交状态
      hasSubmitted.value = false
      // 保存本局记录
      if (data.cards) {
        gameStore.addRound(data.cards)
      }
      uni.showToast({
        title: `第${data.round}局已结算`,
        icon: 'success'
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

// 结算本局（统一计分模式）
const settleRound = () => {
  const cards = {
    player1: gameStore.currentRoundCards.player1,
    player2: gameStore.currentRoundCards.player2,
    player3: gameStore.currentRoundCards.player3,
    player4: gameStore.currentRoundCards.player4
  }
  
  // 验证输入
  if (cards.player1 === 0 && cards.player2 === 0 && cards.player3 === 0 && cards.player4 === 0) {
    uni.showToast({
      title: '请至少输入一个玩家的牌数',
      icon: 'none'
    })
    return
  }
  
  gameStore.addRound(cards)
  gameStore.calculateScores()
  
  // 清空当前局输入
  gameStore.currentRoundCards = {
    player1: 0,
    player2: 0,
    player3: 0,
    player4: 0
  }
  
  uni.showToast({
    title: '本局已结算',
    icon: 'success'
  })
}

// 提交牌数（多人模式）
const submitScore = () => {
  uni.showModal({
    title: '输入牌数',
    editable: true,
    placeholderText: '请输入您的牌数',
    success: (res) => {
      if (res.confirm && res.content) {
        const cards = parseInt(res.content)
        if (isNaN(cards)) {
          uni.showToast({
            title: '请输入有效数字',
            icon: 'none'
          })
          return
        }
        
        // 发送到服务器
        if (gameStore.socket) {
          gameStore.socket.send({
            data: JSON.stringify({
              type: 'submit_cards',
              roomId: gameStore.roomId,
              cards: cards
            })
          })
        } else {
          uni.showToast({
            title: '连接未建立',
            icon: 'none'
          })
        }
        
        hasSubmitted.value = true
        uni.showToast({
          title: '已提交',
          icon: 'success'
        })
      }
    }
  })
}

// 查看结果
const viewResults = () => {
  uni.navigateTo({
    url: '/pages/round-results/round-results'
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F8F8F8;
  padding: 32rpx;
}

.round-header {
  text-align: center;
  margin-bottom: 32rpx;
}

.round-text {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.player-card {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.player-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.player-total-score {
  font-size: 28rpx;
  color: #FF6B9D;
  font-weight: 600;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  min-width: 160rpx;
}

.input {
  flex: 1;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 32rpx;
  border: none;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.score-label {
  font-size: 28rpx;
  color: #666;
}

.score-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.actions {
  display: flex;
  gap: 24rpx;
  padding: 0 32rpx;
}

.btn {
  flex: 1;
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

.btn-disabled {
  background: #E0E0E0;
  color: #999;
}
</style>
