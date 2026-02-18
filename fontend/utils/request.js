// API 请求工具
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://your-backend-url.com' // 替换为实际的微信云托管地址

export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// WebSocket 连接工具
export const createSocket = (url) => {
  return new Promise((resolve, reject) => {
    const socketTask = uni.connectSocket({
      url: url,
      success: () => {
        console.log('WebSocket 连接中...')
      },
      fail: (err) => {
        reject(err)
      }
    })
    
    socketTask.onOpen(() => {
      console.log('WebSocket 连接成功')
      resolve(socketTask)
    })
    
    socketTask.onError((err) => {
      console.error('WebSocket 连接失败', err)
      reject(err)
    })
    
    socketTask.onClose(() => {
      console.log('WebSocket 连接关闭')
    })
  })
}
