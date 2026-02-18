import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // 游戏模式：unified（统一计分）、lan（局域网）、online（联网）
  const gameMode = ref('')
  
  // 房间信息
  const roomId = ref('')
  const roomCode = ref('')
  const isHost = ref(false)
  
  // 玩家信息
  const players = ref([
    { id: 1, name: '玩家1', score: 0 },
    { id: 2, name: '玩家2', score: 0 },
    { id: 3, name: '玩家3', score: 0 },
    { id: 4, name: '玩家4', score: 0 }
  ])
  
  // 当前局数
  const currentRound = ref(0)
  
  // 历史局数记录
  const rounds = ref([])
  
  // 当前局的牌数记录（统一计分模式）
  const currentRoundCards = ref({
    player1: 0,
    player2: 0,
    player3: 0,
    player4: 0
  })
  
  // WebSocket 连接
  const socket = ref(null)
  
  // 设置游戏模式
  const setGameMode = (mode) => {
    gameMode.value = mode
  }
  
  // 设置房间信息
  const setRoomInfo = (id, code, host) => {
    roomId.value = id
    roomCode.value = code
    isHost.value = host
  }
  
  // 更新玩家名称
  const updatePlayerName = (playerId, name) => {
    const player = players.value.find(p => p.id === playerId)
    if (player) {
      player.name = name
    }
  }
  
  // 添加一局游戏
  const addRound = (cards) => {
    currentRound.value++
    rounds.value.push({
      round: currentRound.value,
      cards: { ...cards },
      timestamp: Date.now()
    })
  }
  
  // 计算得分
  const calculateScores = () => {
    if (rounds.value.length === 0) return
    
    // 重置所有玩家得分
    players.value.forEach(player => {
      player.score = 0
    })
    
    // 遍历所有局数计算得分
    rounds.value.forEach(round => {
      const { player1, player2, player3, player4 } = round.cards
      
      // 玩家1得分 = (玩家2-玩家1) + (玩家3-玩家1) + (玩家4-玩家1)
      players.value[0].score += (player2 - player1) + (player3 - player1) + (player4 - player1)
      
      // 玩家2得分 = (玩家1-玩家2) + (玩家3-玩家2) + (玩家4-玩家2)
      players.value[1].score += (player1 - player2) + (player3 - player2) + (player4 - player2)
      
      // 玩家3得分 = (玩家1-玩家3) + (玩家2-玩家3) + (玩家4-玩家3)
      players.value[2].score += (player1 - player3) + (player2 - player3) + (player4 - player3)
      
      // 玩家4得分 = (玩家1-玩家4) + (玩家2-玩家4) + (玩家3-玩家4)
      players.value[3].score += (player1 - player4) + (player2 - player4) + (player3 - player4)
    })
  }
  
  // 重置游戏
  const resetGame = () => {
    currentRound.value = 0
    rounds.value = []
    currentRoundCards.value = {
      player1: 0,
      player2: 0,
      player3: 0,
      player4: 0
    }
    players.value.forEach(player => {
      player.score = 0
    })
  }
  
  // 清空房间信息
  const clearRoomInfo = () => {
    roomId.value = ''
    roomCode.value = ''
    isHost.value = false
    gameMode.value = ''
  }
  
  return {
    gameMode,
    roomId,
    roomCode,
    isHost,
    players,
    currentRound,
    rounds,
    currentRoundCards,
    socket,
    setGameMode,
    setRoomInfo,
    updatePlayerName,
    addRound,
    calculateScores,
    resetGame,
    clearRoomInfo
  }
})
