<template>
  <div
    ref="el"
    class="UiVideo"
    :data-cover="cover"
    :data-playing="state.playing"
  >
    <!-- Play button overlay -->
    <div
      v-if="hasPlayBtn && (state.ended || !state.playing)"
      class="actions"
      @click="play"
    >
      <button type="button" class="play-btn" aria-label="Play video">
        <span class="circle" />
        <span class="icon">▶</span>
      </button>
    </div>

    <!-- Poster image -->
    <ui-picture
      v-if="poster && (!state.playing || state.ended)"
      class="poster"
      :images="posterImages"
      :alt="alt"
      cover="cover"
    />

    <!-- Video element -->
    <video
      ref="video"
      class="video"
      :loop="loop"
      :muted="state.muted"
      :autoplay="autoplay"
      :controls="controls"
      controlsList="nodownload"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
    >
      <source :src="src" :type="videoType">
    </video>
  </div>
</template>

<script setup lang="ts">
/**
 * UiKit - Video
 * 
 * Composant vidéo avec support natif HTML5.
 * Pour les vidéos YouTube/Vimeo, utiliser des iframes externes.
 */

import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
// Note: ui-picture est enregistré globalement via le UiKit

interface VideoProps {
  /** URL de la vidéo */
  src: string
  /** Image poster */
  poster?: string | object
  /** Afficher le bouton play */
  hasPlayBtn?: boolean
  /** Lecture en boucle */
  loop?: boolean
  /** Lecture automatique */
  autoplay?: boolean
  /** Son coupé */
  muted?: boolean
  /** Afficher les contrôles */
  controls?: boolean
  /** Mode couverture */
  cover?: 'cover' | 'contain'
  /** Texte alternatif */
  alt?: string
}

const props = withDefaults(defineProps<VideoProps>(), {
  src: '',
  poster: undefined,
  hasPlayBtn: true,
  loop: false,
  autoplay: false,
  muted: false,
  controls: true,
  cover: 'cover',
  alt: '',
})

const emit = defineEmits<{
  play: []
  pause: []
  stop: []
}>()

const el = ref<HTMLElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)

const state = reactive({
  playing: false,
  muted: props.muted || props.autoplay,
  ended: true,
})

const videoType = computed(() => {
  const ext = props.src.split('.').pop()?.toLowerCase()
  return `video/${ext || 'mp4'}`
})

const posterImages = computed(() => {
  if (typeof props.poster === 'string') {
    return { original: { url: props.poster, sizes: { width: 1920, height: 1080 } } }
  }
  return props.poster
})

const play = () => {
  video.value?.play()
}

const pause = () => {
  video.value?.pause()
}

const stop = () => {
  if (video.value) {
    video.value.pause()
    video.value.currentTime = 0
  }
}

const onPlay = () => {
  state.playing = true
  state.ended = false
  emit('play')
}

const onPause = () => {
  state.playing = false
  emit('pause')
}

const onEnded = () => {
  state.playing = false
  state.ended = true
  emit('stop')
}

onMounted(() => {
  if (props.autoplay) {
    play()
  }
})

onBeforeUnmount(() => {
  stop()
})

defineExpose({
  play,
  pause,
  stop,
  state,
})
</script>

<style lang="stylus" scoped>
.UiVideo
  position relative
  width 100%
  background $gray-900
  overflow hidden

.actions
.poster
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  z-index 20

.actions
  z-index 30
  display flex
  align-items center
  justify-content center
  cursor pointer
  
  &::before
    content ''
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    background rgba(0, 0, 0, 0.3)

.play-btn
  position relative
  display flex
  align-items center
  justify-content center
  rp(width, 100px 60px)
  rp(height, 100px 60px)
  background none
  border none
  color white
  cursor pointer
  
  .circle
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    border-radius 50%
    border 2px solid white
    transition transform 0.3s ease
  
  .icon
    position relative
    z-index 1
    rp(font-size, 24px 16px)
  
  &:hover .circle
    transform scale(1.1)

.poster
  z-index 20

.video
  position relative
  z-index 10
  width 100%
  display block

[data-cover="cover"] .video
  object-fit cover
  height 100%

[data-cover="contain"] .video
  object-fit contain
</style>

