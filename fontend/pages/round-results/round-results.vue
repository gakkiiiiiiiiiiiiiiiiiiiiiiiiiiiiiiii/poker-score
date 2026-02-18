<template>
  <view class="container">
    <view class="results-header">
      <text class="title">局数结果</text>
      <text class="subtitle">共 {{ gameStore.rounds.length }} 局</text>
    </view>
    
    <view class="rounds-list">
      <view 
        v-for="(round, index) in gameStore.rounds" 
        :key="round.round"
        class="round-card"
      >
        <view class="round-header">
          <text class="round-number">第 {{ round.round }} 局</text>
        </view>
        <view class="round-scores">
          <view 
            v-for="(player, idx) in gameStore.players" 
            :key="player.id"
            class="score-item"
          >
            <text class="player-name">{{ player.name }}</text>
            <text class="cards-count">{{ round.cards[`player${player.id}`] }} 张</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="total-scores">
      <text class="total-title">累计得分</text>
      <view 
        v-for="player in sortedPlayers" 
        :key="player.id"
        class="total-item"
      >
        <text class="player-name">{{ player.name }}</text>
        <text class="total-score" :class="{ positive: player.score > 0, negative: player.score < 0 }">
          {{ player.score > 0 ? '+' : '' }}{{ player.score }}
        </text>
      </view>
    </view>
    
    <view class="actions">
      <button class="btn btn-secondary" @click="resetGame">重新开始</button>
      <button class="btn btn-primary" @click="continueGame">继续游戏</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/store/game'

const gameStore = useGameStore()

// 按得分排序的玩家列表
const sortedPlayers = computed(() => {
  return [...gameStore.players].sort((a, b) => b.score - a.score)
})

// 重置游戏
const resetGame = () => {
  uni.showModal({
    title: '确认重置',
    content: '确定要重新开始游戏吗？所有数据将被清空',
    success: (res) => {
      if (res.confirm) {
        gameStore.resetGame()
        uni.navigateBack()
      }
    }
  })
}

// 继续游戏
const continueGame = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F8F8F8;
  padding: 32rpx;
}

.results-header {
  text-align: center;
  margin-bottom: 32rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.rounds-list {
  margin-bottom: 32rpx;
}

.round-card {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.round-header {
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #F5F5F5;
}

.round-number {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.round-scores {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-name {
  font-size: 28rpx;
  color: #666;
}

.cards-count {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.total-scores {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.total-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.total-item:last-child {
  border-bottom: none;
}

.total-score {
  font-size: 36rpx;
  font-weight: 700;
}

.total-score.positive {
  color: #4CAF50;
}

.total-score.negative {
  color: #F44336;
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
</style>
