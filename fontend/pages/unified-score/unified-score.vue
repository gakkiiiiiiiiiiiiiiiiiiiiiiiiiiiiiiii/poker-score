<template>
  <view class="container">
    <view class="player-list">
      <view 
        v-for="(player, index) in gameStore.players" 
        :key="player.id"
        class="player-card"
      >
        <view class="player-header">
          <text class="player-name">{{ player.name }}</text>
          <text class="player-score">总分: {{ player.score }}</text>
        </view>
        <view class="input-group">
          <text class="label">当前局牌数:</text>
          <input 
            class="input"
            type="number"
            v-model.number="gameStore.currentRoundCards[`player${player.id}`]"
            placeholder="输入牌数"
          />
        </view>
      </view>
    </view>
    
    <view class="round-info">
      <text class="round-text">当前第 {{ gameStore.currentRound + 1 }} 局</text>
    </view>
    
    <view class="actions">
      <button class="btn btn-secondary" @click="addRound">结算本局</button>
      <button class="btn btn-primary" @click="viewResults">查看结果</button>
    </view>
  </view>
</template>

<script setup>
import { useGameStore } from '@/store/game'

const gameStore = useGameStore()

const addRound = () => {
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

.player-score {
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

.round-info {
  text-align: center;
  margin-bottom: 32rpx;
}

.round-text {
  font-size: 32rpx;
  color: #666;
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
