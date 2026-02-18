<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
page {
  background-color: #F8F8F8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

/* 通用按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%);
  color: white;
  border-radius: 24px;
  padding: 24rpx 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.3);
}

.btn-secondary {
  background: white;
  color: #FF6B9D;
  border-radius: 24px;
  padding: 24rpx 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: 2rpx solid #FF6B9D;
}

/* 卡片样式 */
.card {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

/* 输入框样式 */
.input {
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 32rpx;
  border: none;
}
</style>
