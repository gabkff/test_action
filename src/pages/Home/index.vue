<template>
  <div class="touch-test">
    <!-- Zone de feedback centrale -->
    <div class="feedback-zone" :class="{ active: lastTouch }">
      <transition name="pop" mode="out-in">
        <div v-if="lastTouch" :key="touchCount" class="feedback-content">
          <div class="feedback-icon">{{ lastTouch.icon }}</div>
          <div class="feedback-label">{{ lastTouch.label }}</div>
          <div class="feedback-count">Touch #{{ touchCount }}</div>
        </div>
        <div v-else class="feedback-waiting">
          <div class="feedback-title">Test Tactile</div>
          <div class="feedback-hint">Touchez un des 4 coins</div>
        </div>
      </transition>
    </div>

    <!-- Historique des touches -->
    <div class="touch-history">
      <div 
        v-for="(touch, index) in touchHistory" 
        :key="index" 
        class="history-item"
        :style="{ backgroundColor: touch.color }"
      >
        {{ touch.icon }}
      </div>
    </div>

    <!-- Bouton Reset -->
    <button class="reset-button" @click="resetTest">
      🔄 Reset
    </button>

    <!-- Les 4 boutons de coins -->
    <button
      class="corner-button top-left"
      @click="handleTouch('top-left')"
      @touchstart.prevent="handleTouch('top-left')"
    >
      <span class="corner-icon">↖️</span>
      <span class="corner-label">1</span>
    </button>

    <button
      class="corner-button top-right"
      @click="handleTouch('top-right')"
      @touchstart.prevent="handleTouch('top-right')"
    >
      <span class="corner-icon">↗️</span>
      <span class="corner-label">2</span>
    </button>

    <button
      class="corner-button bottom-left"
      @click="handleTouch('bottom-left')"
      @touchstart.prevent="handleTouch('bottom-left')"
    >
      <span class="corner-icon">↙️</span>
      <span class="corner-label">3</span>
    </button>

    <button
      class="corner-button bottom-right"
      @click="handleTouch('bottom-right')"
      @touchstart.prevent="handleTouch('bottom-right')"
    >
      <span class="corner-icon">↘️</span>
      <span class="corner-label">4</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface TouchInfo {
  icon: string
  label: string
  color: string
  position: string
}

const corners: Record<string, TouchInfo> = {
  'top-left': {
    icon: '↖️',
    label: 'Coin Haut-Gauche',
    color: '#667eea',
    position: 'top-left'
  },
  'top-right': {
    icon: '↗️',
    label: 'Coin Haut-Droite',
    color: '#f093fb',
    position: 'top-right'
  },
  'bottom-left': {
    icon: '↙️',
    label: 'Coin Bas-Gauche',
    color: '#4facfe',
    position: 'bottom-left'
  },
  'bottom-right': {
    icon: '↘️',
    label: 'Coin Bas-Droite',
    color: '#43e97b',
    position: 'bottom-right'
  }
}

const lastTouch = ref<TouchInfo | null>(null)
const touchCount = ref(0)
const touchHistory = reactive<TouchInfo[]>([])

const handleTouch = (position: string) => {
  const touch = corners[position]
  lastTouch.value = touch
  touchCount.value++
  
  // Ajoute à l'historique (max 10 derniers)
  touchHistory.unshift({ ...touch })
  if (touchHistory.length > 10) {
    touchHistory.pop()
  }
  
  // Feedback haptique si disponible (mobile/tablette)
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

const resetTest = () => {
  lastTouch.value = null
  touchCount.value = 0
  touchHistory.splice(0, touchHistory.length)
}
</script>

<style lang="stylus" scoped>
.touch-test
  position: fixed
  inset: 0
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)
  display: flex
  align-items: center
  justify-content: center
  overflow: hidden

// Zone de feedback centrale
.feedback-zone
  width: 400px
  height: 250px
  background: rgba(255, 255, 255, 0.05)
  border: 2px solid rgba(255, 255, 255, 0.1)
  border-radius: 24px
  display: flex
  align-items: center
  justify-content: center
  transition: all 0.3s ease
  backdrop-filter: blur(10px)

  &.active
    background: rgba(255, 255, 255, 0.1)
    border-color: rgba(255, 255, 255, 0.3)
    box-shadow: 0 0 60px rgba(102, 126, 234, 0.3)

.feedback-content
  text-align: center
  color: white

.feedback-icon
  font-size: 4rem
  margin-bottom: 1rem
  animation: bounce 0.5s ease

.feedback-label
  font-size: 1.5rem
  font-weight: 600
  margin-bottom: 0.5rem

.feedback-count
  font-size: 1rem
  opacity: 0.6

.feedback-waiting
  text-align: center
  color: rgba(255, 255, 255, 0.7)

.feedback-title
  font-size: 2rem
  font-weight: 700
  margin-bottom: 0.5rem
  color: white

.feedback-hint
  font-size: 1.2rem
  opacity: 0.6

// Historique
.touch-history
  position: fixed
  bottom: 120px
  left: 50%
  transform: translateX(-50%)
  display: flex
  gap: 8px

.history-item
  width: 40px
  height: 40px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  font-size: 1.2rem
  animation: fadeIn 0.3s ease

// Bouton reset
.reset-button
  position: fixed
  bottom: 50px
  left: 50%
  transform: translateX(-50%)
  padding: 12px 32px
  background: rgba(255, 255, 255, 0.1)
  border: 1px solid rgba(255, 255, 255, 0.2)
  border-radius: 30px
  color: white
  font-size: 1rem
  cursor: pointer
  transition: all 0.2s ease

  &:hover
  &:active
    background: rgba(255, 255, 255, 0.2)
    transform: translateX(-50%) scale(1.05)

// Boutons de coins
.corner-button
  position: fixed
  width: 120px
  height: 120px
  background: rgba(255, 255, 255, 0.1)
  border: 2px solid rgba(255, 255, 255, 0.2)
  border-radius: 16px
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  cursor: pointer
  transition: all 0.2s ease
  backdrop-filter: blur(5px)

  &:active
    transform: scale(0.95)
    background: rgba(255, 255, 255, 0.3)

  .corner-icon
    font-size: 2.5rem
    margin-bottom: 0.5rem

  .corner-label
    font-size: 1.5rem
    font-weight: 700
    color: white

// Positions des coins
.top-left
  top: 40px
  left: 40px
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(102, 126, 234, 0.1))
  border-color: rgba(102, 126, 234, 0.5)

.top-right
  top: 40px
  right: 40px
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.3), rgba(240, 147, 251, 0.1))
  border-color: rgba(240, 147, 251, 0.5)

.bottom-left
  bottom: 40px
  left: 40px
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(79, 172, 254, 0.1))
  border-color: rgba(79, 172, 254, 0.5)

.bottom-right
  bottom: 40px
  right: 40px
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.3), rgba(67, 233, 123, 0.1))
  border-color: rgba(67, 233, 123, 0.5)

// Animations
@keyframes bounce
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(1.2)

@keyframes fadeIn
  from
    opacity: 0
    transform: scale(0.5)
  to
    opacity: 1
    transform: scale(1)

// Transitions Vue
.pop-enter-active
  animation: pop 0.3s ease

.pop-leave-active
  animation: pop 0.2s ease reverse

@keyframes pop
  0%
    opacity: 0
    transform: scale(0.8)
  100%
    opacity: 1
    transform: scale(1)
</style>