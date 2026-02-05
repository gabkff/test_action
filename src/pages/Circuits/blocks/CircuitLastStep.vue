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
          <ui-button 
            theme="primary"
            :big="IsDesktop"
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
import { computed } from 'vue'
import { store as interfaceStore } from 'plugins/store/interface'
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
const IsDesktop = computed(() => interfaceStore.isDesktop)
</script>

<style lang="stylus" scoped>
.circuit-last-step
  height 100%
  &__background
    position absolute
    left 0
    top 1560px
    width 100%
    color $aube
    &[data-circuit-theme="1"]
      color $crepuscule
    &[data-circuit-theme="2"]
      color $bouleau
    +layout(mobile)
      left -80%
      top 135px

  &__navbar
    position absolute
    r(right, -95px -45px)
    top 50px

  &__qr-container
    background white
    r(padding, 30px 15px)
    r(width, 880px 350px)
    position absolute
    r(top, 878px 256px)
    r(right, 273px 118px)

  &__qr-header
    f-style('h5')
    width 70%
    color $fjord
    r(margin-bottom, 140px 42px)
    +layout(mobile)
      font-size 23px
      line-height 1.1
      font-weight $fw-bold

  &__qr-code
    width 100%
    height 100%
    r(margin-bottom, 80px 40px)
    f(row, $justify: center, $align: center)
    img
      r(size, 369px 130px)

  &__recommendations
    background white
    f(column, $justify: flex-start)
    r(width, 791px 442px)
    r(padding, 60px 30px)
    position absolute
    r(top, 1113px 256px)
    r(left, 150px 75px)

  &__recommendations-header
    f-style('h5')
    color $fjord
    r(margin-bottom, 30px 14px)
    +layout(mobile)
      font-size 23px
      line-height 1.1
      font-weight $fw-bold

  &__recommendations-text
    f-style('default')
    color $fjord
    r(margin-bottom, 80px 30px)
    +layout(mobile)
      font-size 18px
      line-height 1.3
      font-weight $fw-medium

  &__recommendations-feedback
    f-style('h5')
    color $fjord
    +layout(mobile)
      font-size 23px
      line-height 1.1
      font-weight $fw-bold

  &__recommendations-buttons
    f(row, $justify: flex-start)
    r(gap, 20px 7px)

  &__pouce-button
    r(size, 210px 80px)
    :deep(.UiButton__icon)
      r(size, 89px 33px)
    &[data-down="true"]
      :deep(.UiButton__icon)
        transform rotate(-180deg)

  &__event
    r(width, 850px 391px)
    position absolute
    r(top, 1941px 650px)
    r(left, 150px 560px)

  &__event-header
    font-family $ff-title
    font-weight $fw-extrabold
    text-transform uppercase
    color $fjord
    r(margin-bottom, 45px 15px)
    r(font-size, 90px 24px)
    +layout(mobile)
      font-family $ff-text
      text-transform none

  &__event-content
    background-size cover
    background-position center
    r(min-height, 650px 270px)
    color $ecume
    f(column, $justify: flex-end)
    z-index 2
    border-radius $radius-lgxl
    +layout(mobile)
      border-radius 10px

  &__event-overlay
    background-color rgba(0,0,0,0.7)
    r(padding, 30px 15px)
    height 100%
    color $ecume
    f(column, $justify: flex-end)
    border-radius $radius-lgxl
    flex 1
    +layout(mobile)
      border-radius 10px
    

  &__event-time
    font-family $ff-text
    r(font-size, 32px 16px)
    line-height 1.2
    r(margin-bottom, 18px 9px)
    &::first-letter
      text-transform uppercase

  &__event-title
    font-family $ff-text
    r(font-size, 50px 24px)
    line-height 1.2
    font-weight $fw-bold
    r(margin-bottom, 45px 22px)

  &__event-button
    width fit-content

  &__other-born
    position absolute
    top 2837px
    left 260px
    padding 60px
    r(width, 765px 389px)
    background-color white
    border-radius $radius-lg
    f(row, $justify: flex-start, $align: flex-start)
    r(gap, 60px 28px)
    +layout(mobile)
      top 1000px
      left 560px
      padding-left 42px
      padding-right 42px
      padding-top 28px
      padding-bottom 28px

  &__other-born-img
    r(width, 154px 54px)
    flex-shrink 0

  &__other-born-text
    margin auto
    f(column, $justify: flex-start, $align: flex-start)
    r(gap, 15px 7px)
    color $fjord

  &__other-born-label
    opacity 0.5
    f-style('default')
    +layout(mobile)
      font-size 17px
      line-height 1.4
      font-weight $fw-medium

  &__other-born-content
    f-style('h5')
    +layout(mobile)
      font-size 24px
      line-height 1.1
      font-weight $fw-bold

  &__next-circuit
    position absolute
    top 1865px
    right 269px
    r(width, 790px 444px)
    f(column, $justify: flex-start, $align: flex-start)
    r(gap, 50px 15px)
    +layout(mobile)
      top 600px
      right 0px
      left 75px

  &__next-circuit-header
    f-style('h5')
    color $fjord
    +layout(mobile)
      font-size 24px
      line-height 1.1
      font-weight $fw-bold

  &__next-circuit-card
    r(padding, 10px 8px)
    padding-bottom 30px
    f(column, $justify: flex-start, $align: flex-start)
    gap 5px
    border-radius $radius-lgxl
    background-color $fjord
    color $aube
    +layout(mobile)
      padding-bottom 0
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
      r(height, 800px 284px)
      width 100%
      +layout(mobile)
        order 2
        padding-bottom 7px


  &__next-circuit-info
    r(padding, 20px 10px)
    width 100%
    +layout(mobile)
      padding-top 0px

  &__next-circuit-title
    f-style('h2')
    margin-bottom 30px
    +layout(mobile)
      font-family $ff-title
      font-size 48px
      line-height 1.1
      font-weight $fw-extrabold

  &__next-circuit-description
    f-style('h6')
    f(column, $justify: flex-end)
    r(gap, 20px 14px)
    margin-left auto
    color $aube
    text-align right
    +layout(mobile)
      font-size 14px
      line-height 1.3
      font-weight $fw-regular

  &__next-circuit-action
    f(row, $justify: flex-end)
    gap 15px
    :deep(.UiButton)
      width fit-content
</style>
