<template>
  <div class="touch-test">
    <!-- Zone centrale avec image du premier circuit -->
    <div class="center-zone">
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-button">Réessayer</button>
      </div>

      <!-- Image du premier circuit -->
      <div v-else-if="firstCircuitImage" class="circuit-preview">
        <img 
          :src="firstCircuitImageUrl" 
          :alt="firstCircuit?.title"
          class="circuit-image"
        />
        <div class="circuit-info">
          <h2>{{ firstCircuit?.title }}</h2>
          <p v-if="circuitsCount > 0">{{ circuitsCount }} circuit(s) disponible(s)</p>
        </div>
      </div>

      <!-- Fallback si pas d'image -->
      <div v-else class="no-image">
        <div class="placeholder-icon">🏔️</div>
        <p>Aucune image disponible</p>
      </div>

      <!-- Zone de feedback tactile (superposée) -->
      <transition name="pop" mode="out-in">
        <div v-if="lastTouch" :key="touchCount" class="feedback-overlay">
          <div class="feedback-icon">{{ lastTouch.icon }}</div>
          <div class="feedback-label">{{ lastTouch.label }}</div>
          <div class="feedback-count">Touch #{{ touchCount }}</div>
        </div>
      </transition>
    </div>

    <!-- Infos mode et cache -->
    <div class="mode-info">
      <span class="mode-badge">{{ appConfig.mode.toUpperCase() }}</span>
      <span class="cache-badge" :class="{ enabled: appConfig.enableCache }">
        Cache: {{ appConfig.enableCache ? 'ON' : 'OFF' }}
      </span>
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

    <!-- Boutons d'actions -->
    <div class="actions">
      <button class="action-button reset" @click="resetTest">
        🔄 Reset Touch
      </button>
      <button class="action-button refresh" @click="refreshData" :disabled="isLoading">
        🔄 Refresh Data
      </button>
      <button 
        v-if="appConfig.enableCache" 
        class="action-button clear" 
        @click="clearCache"
        :disabled="isLoading"
      >
        🗑️ Clear Cache
      </button>
    </div>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from 'store/app'
import { apiService } from 'plugins/api'
import { assetsService } from 'plugins/api/assets.service'
import { appConfig } from 'config'

// ============================================
// STORE & DATA
// ============================================

const store = useAppStore()
const { isLoading, error, apiData } = storeToRefs(store)

// Récupère le premier circuit
const firstCircuit = computed(() => {
  return apiData.value?.data?.data?.circuits?.[0] ?? null
})

// Récupère l'image du premier circuit
const firstCircuitImage = computed(() => {
  return firstCircuit.value?.image ?? null
})

// URL de l'image (via le service assets pour le cache)
const firstCircuitImageUrl = computed(() => {
  if (!firstCircuitImage.value) return ''
  return assetsService.getImageUrl(firstCircuitImage.value, '768')
})

// Nombre de circuits
const circuitsCount = computed(() => {
  return apiData.value?.data?.data?.circuits?.length ?? 0
})

// ============================================
// DATA LOADING
// ============================================

const loadData = async () => {
  try {
    store.setLoading(true)
    store.clearError()
    
    let data = await apiService.fetchData()

    // Télécharge les assets si en mode borne
    if (appConfig.enableCache) {
      data = await assetsService.downloadAllAssets(data)
    }

    store.setApiData(data)
  } catch (err) {
    store.setError(err instanceof Error ? err.message : 'Une erreur est survenue')
  } finally {
    store.setLoading(false)
  }
}

const refreshData = async () => {
  try {
    store.setLoading(true)
    store.clearError()
    
    let data = await apiService.refresh()

    if (appConfig.enableCache) {
      data = await assetsService.downloadAllAssets(data)
    }

    store.setApiData(data)
  } catch (err) {
    store.setError(err instanceof Error ? err.message : 'Erreur lors du rafraîchissement')
  } finally {
    store.setLoading(false)
  }
}

const clearCache = async () => {
  if (confirm('Êtes-vous sûr de vouloir vider le cache ?')) {
    try {
      await apiService.clearCache()
      await assetsService.clearAssets()
      alert('Cache vidé avec succès !')
      // Recharge les données
      await loadData()
    } catch (err) {
      alert('Erreur lors du vidage du cache')
    }
  }
}

// ============================================
// TOUCH TEST
// ============================================

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

  // Efface le feedback après 2 secondes
  setTimeout(() => {
    if (lastTouch.value?.position === position) {
      lastTouch.value = null
    }
  }, 2000)
}

const resetTest = () => {
  lastTouch.value = null
  touchCount.value = 0
  touchHistory.splice(0, touchHistory.length)
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  // Initialise le service des assets uniquement en mode cache
  if (appConfig.enableCache) {
    try {
      await assetsService.init()
    } catch (err) {
      console.error('Erreur lors de l\'initialisation du service des assets:', err)
    }
  }
  // Charge les données
  await loadData()
})
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

// ============================================
// ZONE CENTRALE
// ============================================

.center-zone
  position: relative
  width: 500px
  height: 400px
  background: rgba(255, 255, 255, 0.05)
  border: 2px solid rgba(255, 255, 255, 0.1)
  border-radius: 24px
  display: flex
  align-items: center
  justify-content: center
  overflow: hidden
  backdrop-filter: blur(10px)

.circuit-preview
  width: 100%
  height: 100%
  position: relative

.circuit-image
  width: 100%
  height: 100%
  object-fit: cover
  border-radius: 22px

.circuit-info
  position: absolute
  bottom: 0
  left: 0
  right: 0
  padding: 1.5rem
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent)
  border-radius: 0 0 22px 22px

  h2
    color: white
    font-size: 1.5rem
    margin-bottom: 0.5rem

  p
    color: rgba(255,255,255,0.7)
    font-size: 1rem

.no-image
  text-align: center
  color: rgba(255,255,255,0.5)

  .placeholder-icon
    font-size: 4rem
    margin-bottom: 1rem

// ============================================
// LOADING & ERROR STATES
// ============================================

.loading-state
  text-align: center
  color: white

  .spinner
    border: 4px solid rgba(255,255,255,0.1)
    border-top: 4px solid #667eea
    border-radius: 50%
    width: 50px
    height: 50px
    animation: spin 1s linear infinite
    margin: 0 auto 1rem

  p
    opacity: 0.7

.error-state
  text-align: center
  color: white
  padding: 2rem

  .error-icon
    font-size: 3rem
    margin-bottom: 1rem

  p
    margin-bottom: 1rem
    opacity: 0.8

  .retry-button
    padding: 0.75rem 1.5rem
    background: #667eea
    color: white
    border: none
    border-radius: 8px
    cursor: pointer
    font-size: 1rem

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

// ============================================
// FEEDBACK OVERLAY
// ============================================

.feedback-overlay
  position: absolute
  inset: 0
  background: rgba(0,0,0,0.85)
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  border-radius: 22px
  color: white
  z-index: 10

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

// ============================================
// MODE INFO
// ============================================

.mode-info
  position: fixed
  top: 20px
  left: 50%
  transform: translateX(-50%)
  display: flex
  gap: 1rem
  z-index: 100

.mode-badge
.cache-badge
  padding: 0.5rem 1rem
  background: rgba(255,255,255,0.1)
  border: 1px solid rgba(255,255,255,0.2)
  border-radius: 20px
  color: white
  font-size: 0.85rem
  font-weight: 600

.cache-badge.enabled
  background: rgba(67, 233, 123, 0.2)
  border-color: rgba(67, 233, 123, 0.5)
  color: #43e97b

// ============================================
// HISTORIQUE DES TOUCHES
// ============================================

.touch-history
  position: fixed
  bottom: 140px
  left: 50%
  transform: translateX(-50%)
  display: flex
  gap: 8px
  z-index: 100

.history-item
  width: 40px
  height: 40px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  font-size: 1.2rem
  animation: fadeIn 0.3s ease

// ============================================
// BOUTONS D'ACTIONS
// ============================================

.actions
  position: fixed
  bottom: 50px
  left: 50%
  transform: translateX(-50%)
  display: flex
  gap: 1rem
  z-index: 100

.action-button
  padding: 12px 24px
  background: rgba(255, 255, 255, 0.1)
  border: 1px solid rgba(255, 255, 255, 0.2)
  border-radius: 30px
  color: white
  font-size: 0.95rem
  cursor: pointer
  transition: all 0.2s ease
  white-space: nowrap

  &:hover
  &:active
    background: rgba(255, 255, 255, 0.2)
    transform: scale(1.05)

  &:disabled
    opacity: 0.5
    cursor: not-allowed
    transform: none

  &.refresh
    background: rgba(102, 126, 234, 0.3)
    border-color: rgba(102, 126, 234, 0.5)

  &.clear
    background: rgba(255, 100, 100, 0.2)
    border-color: rgba(255, 100, 100, 0.4)

// ============================================
// BOUTONS DE COINS
// ============================================

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
  z-index: 100

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

// ============================================
// ANIMATIONS
// ============================================

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
