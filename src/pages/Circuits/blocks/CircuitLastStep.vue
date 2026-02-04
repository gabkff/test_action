<template>
  <div class="circuit-last-step">
    <div class="circuit-last-step__background" v-html="IconLine" :data-circuit-theme="circuitIndex"></div>
    
    <!-- QR Code Section -->
    <div class="circuit-last-step__qr-container">
      <UiNavBar 
        key="navbarend" 
        class="circuit-last-step__navbar" 
        :lastStep="true" 
        :next="false" 
        :previous="true"  
        @previous="$emit('previous')" 
        :panel="false" 
        @menu="$emit('restart')" 
      />
      <div class="circuit-last-step__qr-content">
        <div class="circuit-last-step__qr-header">
          {{ $t('circuits.qrcode_panel') }} 
        </div>
        <div class="circuit-last-step__qr-code">
          <img :src="circuit.base64_qr as string" alt="QR Code" />
        </div>
      </div>
    </div>

    <!-- Recommendations Section -->
    <div class="circuit-last-step__recommendations">
      <div class="circuit-last-step__recommendations-header" :style="{ opacity: feedbackSent ? 0 : 1 }">
        {{ $t('circuits.recommendations') }} 
      </div>
      <div class="circuit-last-step__recommendations-content">
        <div class="circuit-last-step__recommendations-text" :style="{ opacity: feedbackSent ? 0 : 1 }">
          {{ $t('circuits.recommendations_text') }}
        </div>
        <div class="circuit-last-step__recommendations-feedback" :style="{ opacity: feedbackSent ? 1 : 0 }">
          {{ $t('circuits.recommendations_feedback') }}
        </div>
        <div class="circuit-last-step__recommendations-buttons" :style="{ opacity: feedbackSent ? 0 : 1 }">
          <ui-button 
            theme="primary" 
            :big="true" 
            :icon="IconPouce" 
            class="circuit-last-step__pouce-button" 
            @click="$emit('feedback', 'up')"
          />
          <ui-button 
            theme="primary" 
            :icon="IconPouce" 
            class="circuit-last-step__pouce-button" 
            :data-down="true" 
            @click="$emit('feedback', 'down')"
          />
        </div>
      </div>
    </div>

    <!-- Next Event Section -->
    <div class="circuit-last-step__event" v-if="nextEvent?.event">
      <div class="circuit-last-step__event-header">
        {{ nextEvent.label }}
      </div>
      <div 
        class="circuit-last-step__event-content"
        :style="{ backgroundImage: `url(${nextEvent.event.main_image?.images?.original?.url})` }"
      >
        <div class="circuit-last-step__event-overlay">
          <div class="circuit-last-step__event-time" v-if="nextEvent.event.time_start || nextEvent.event.time_end">
            <template v-if="nextEvent.event.time_start && !nextEvent.event.time_end">
              {{ $t('events.time_start', { time: nextEvent.event.time_start }) }}
            </template>
            <template v-else>
              {{ $t('events.time_start_end', { start: nextEvent.event.time_start, end: nextEvent.event.time_end }) }}
            </template>
          </div>
          <div class="circuit-last-step__event-title">
            {{ nextEvent.event.title }}
          </div>
          <UiButton 
            theme="primary"
            :big="true"
            :icon="IconPlus"
            :iconPosition="'right'"
            :label="$t('events.see_all')"
            class="circuit-last-step__event-button"
            @click="router.push('/evenements')"
          />
        </div>
      </div>
    </div>

    <!-- Other Bornes Section -->
    <div class="circuit-last-step__other-born">
      <div class="circuit-last-step__other-born-img">
        <img :src="imgBorn" alt="Borne" />
      </div>
      <div class="circuit-last-step__other-born-text">
        <div class="circuit-last-step__other-born-label">
          {{ $t('common.go_further') }}
        </div>
        <div class="circuit-last-step__other-born-content">
          {{ $t('common.other_born') }}
        </div>
      </div>
    </div>

    <!-- Next Circuit Section -->
    <div class="circuit-last-step__next-circuit" v-if="nextCircuit">
      <div class="circuit-last-step__next-circuit-header">
        {{ $t('common.discover_more') }}
      </div>
      <div class="circuit-last-step__next-circuit-card" :data-circuit-theme="nextCircuitIndex">
        <ui-picture :images="nextCircuit?.image?.images" cover="cover" />
        <div class="circuit-last-step__next-circuit-info">
          <div class="circuit-last-step__next-circuit-title">
            {{ nextCircuit.title }}
          </div>
          <div class="circuit-last-step__next-circuit-description">
            <ui-wysiwyg v-html="nextCircuit.description" />
            <div class="circuit-last-step__next-circuit-action">
              <ui-tag :label="$t('circuits.total_step', { number: nextCircuit.steps.length })" />
              <ui-button 
                theme="primary" 
                :label="$t('common.link_discover')" 
                :icon="IconPlus" 
                :iconPosition="'right'"
                @click="router.push(`/circuits/${nextCircuit.id}`)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CircuitLastStep - Écran de fin de circuit
 * 
 * Affiche :
 * - QR code pour télécharger le parcours
 * - Section feedback (like/dislike)
 * - Prochain événement
 * - Mention des autres bornes
 * - Prochain circuit à découvrir
 */

import { useRouter } from 'vue-router'
import UiNavBar from 'components/NavBar/index.vue'
import UiTag from 'components/UiKit/Tag/index.vue'
import IconLine from 'assets/svg/line_background.svg?raw'
import IconPlus from 'assets/svg/plus.svg?raw'
import IconPouce from 'assets/svg/pouce.svg?raw'
import imgBorn from 'assets/img/borne.png'

interface Props {
  /** Circuit courant */
  circuit: CircuitEntry
  /** Index du circuit (pour le thème) */
  circuitIndex?: number | null
  /** Prochain événement avec son label */
  nextEvent?: { event: EventEntry | null; label: string } | null
  /** Circuit suivant */
  nextCircuit?: CircuitEntry | null
  /** Index du circuit suivant */
  nextCircuitIndex?: number | null
  /** Si le feedback a été envoyé */
  feedbackSent: boolean
}

defineProps<Props>()

defineEmits<{
  /** Retour à l'étape précédente */
  previous: []
  /** Redémarrer le circuit */
  restart: []
  /** Envoyer un feedback */
  feedback: [direction: 'up' | 'down']
}>()

const router = useRouter()
</script>

<style lang="stylus" scoped>
.circuit-last-step
  position relative

  &__background
    position absolute
    left 0
    top 35%
    bottom 25%
    color $aube
    &[data-circuit-theme="1"]
      color $crepuscule
    &[data-circuit-theme="2"]
      color $bouleau

  &__navbar
    position absolute
    right -95px
    top 50px

  &__qr-container
    background white
    r(padding, 30px)
    r(width, 880px)
    position absolute
    top 878px
    right 273px

  &__qr-header
    f-style('h5')
    width 70%
    color $fjord
    margin-bottom 140px

  &__qr-code
    width 100%
    height 100%
    margin-bottom 80px
    f(row, $justify: center, $align: center)
    img
      r(size, 369px)

  &__recommendations
    background white
    f(column, $justify: flex-start)
    r(width, 791px)
    r(padding, 60px)
    position absolute
    top 1113px
    left 150px

  &__recommendations-header
    f-style('h5')
    color $fjord
    margin-bottom 30px

  &__recommendations-text
    f-style('default')
    color $fjord
    margin-bottom 80px

  &__recommendations-feedback
    f-style('h5')
    color $fjord

  &__recommendations-buttons
    f(row, $justify: flex-start)
    gap 20px

  &__pouce-button
    size 210px
    :deep(.UiButton__icon)
      size 89px
    &[data-down="true"]
      :deep(.UiButton__icon)
        transform rotate(-180deg)

  &__event
    r(width, 850px)
    position absolute
    top 1941px
    left 150px

  &__event-header
    font-family $ff-title
    font-weight $fw-extrabold
    text-transform uppercase
    color $fjord
    margin-bottom 45px
    r(font-size, 90px 40px)

  &__event-content
    background-size cover
    background-position center
    r(height, 650px)
    color $ecume
    f(column, $justify: flex-end)
    z-index 2

  &__event-overlay
    background-color rgba(0,0,0,0.7)
    r(padding, 30px)
    height 100%
    color $ecume
    f(column, $justify: flex-end)

  &__event-time
    font-size 32px
    line-height 1.2
    margin-bottom 18px
    &::first-letter
      text-transform uppercase

  &__event-title
    font-family $ff-text
    font-size 50px
    line-height 1.2
    font-weight $fw-bold
    margin-bottom 45px

  &__event-button
    width fit-content

  &__other-born
    position absolute
    top 2837px
    left 260px
    padding 60px
    r(width, 765px)
    background-color white
    border-radius $radius-lg
    f(row, $justify: flex-start, $align: flex-start)
    gap 60px

  &__other-born-img
    r(width, 154px)
    flex-shrink 0

  &__other-born-text
    margin auto
    f(column, $justify: flex-start, $align: flex-start)
    gap 15px
    color $fjord

  &__other-born-label
    opacity 0.5
    f-style('default')

  &__other-born-content
    f-style('h5')

  &__next-circuit
    position absolute
    top 1865px
    right 269px
    r(width, 790px)
    f(column, $justify: flex-start, $align: flex-start)
    gap 50px

  &__next-circuit-header
    f-style('h5')
    color $fjord

  &__next-circuit-card
    padding 10px
    padding-bottom 30px
    f(column, $justify: flex-start, $align: flex-start)
    gap 5px
    border-radius $radius-lgxl
    background-color $fjord
    color $aube
    &[data-circuit-theme="1"]
      background-color $penombre
      .circuit-last-step__next-circuit-title,
      .circuit-last-step__next-circuit-description
        color $crepuscule
    &[data-circuit-theme="2"]
      background-color $epinette
      .circuit-last-step__next-circuit-title,
      .circuit-last-step__next-circuit-description
        color $bouleau
    :deep(.UiPicture)
      r(height, 800px)
      width 100%

  &__next-circuit-info
    padding 20px
    width 100%

  &__next-circuit-title
    f-style('h2')
    margin-bottom 30px

  &__next-circuit-description
    f-style('h6')
    f(column, $justify: flex-end)
    gap 20px
    margin-left auto
    color $aube
    text-align right

  &__next-circuit-action
    f(row, $justify: flex-end)
    gap 15px
    :deep(.UiButton)
      width fit-content
</style>
