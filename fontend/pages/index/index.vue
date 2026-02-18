<template>
  <view class="container">
    <view class="header">
      <text class="title">锄大地计分</text>
      <text class="subtitle">选择计分模式</text>
    </view>
    
    <view class="mode-list">
      <view class="mode-card" @click="goToUnifiedScore">
        <view class="mode-icon">📝</view>
        <view class="mode-info">
          <text class="mode-title">统一计分</text>
          <text class="mode-desc">单人统计所有玩家牌数</text>
        </view>
        <text class="arrow">›</text>
      </view>
      
      <view class="mode-card" @click="goToLanRoom">
        <view class="mode-icon">📡</view>
        <view class="mode-info">
          <text class="mode-title">局域网计分</text>
          <text class="mode-desc">创建房间，邀请局域网玩家</text>
        </view>
        <text class="arrow">›</text>
      </view>
      
      <view class="mode-card" @click="goToOnlineRoom">
        <view class="mode-icon">🌐</view>
        <view class="mode-info">
          <text class="mode-title">联网计分</text>
          <text class="mode-desc">创建房间，输入房间号加入</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useGameStore } from '@/store/game'

const gameStore = useGameStore()

const goToUnifiedScore = () => {
  gameStore.setGameMode('unified')
  uni.navigateTo({
    url: '/pages/unified-score/unified-score'
  })
}

const goToLanRoom = () => {
  gameStore.setGameMode('lan')
  uni.navigateTo({
    url: '/pages/lan-room/lan-room'
  })
}

const goToOnlineRoom = () => {
  gameStore.setGameMode('online')
  uni.navigateTo({
    url: '/pages/online-room/online-room'
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FF6B9D 0%, #FF8E9B 100%);
  padding: 80rpx 32rpx 32rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.title {
  display: block;
  font-size: 64rpx;
  font-weight: 700;
  color: white;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.mode-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.mode-card {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.mode-card:active {
  transform: scale(0.98);
}

.mode-icon {
  font-size: 64rpx;
  margin-right: 24rpx;
}

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.mode-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.mode-desc {
  font-size: 26rpx;
  color: #999;
}

.arrow {
  font-size: 48rpx;
  color: #FF6B9D;
  font-weight: 300;
}
</style>
