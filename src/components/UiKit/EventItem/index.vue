<template>
  <div class="EventItem" @click="handleClick">
    <span class="EventItem__border -top" />
    
    <div class="EventItem__content">
      <!-- Horaire à gauche -->
      <div class="EventItem__time">
        <template v-if="time && time.start && time.end && time.start !== time.end && time.start !== '00:00' && time.end !== '00:00'">
          <span class="EventItem__time-text">
            {{ $t('events.time_start_end', { start: time.start, end: time.end }) }}
          </span>
        </template>
        <span class="EventItem__time-text" v-else-if="time">
          {{ time.start || time.end }}
        </span>
      </div>
      
      <!-- Infos au milieu -->
      <div class="EventItem__info">
        <div class="EventItem__location" v-if="location">
          <i class="EventItem__icon_pin" v-html="IconLocation" />
          <span>{{ location }}</span>
        </div>
        <div class="EventItem__title-container">
          <h3 class="EventItem__title" v-html="title"/>
          <button type="button" class="EventItem__action" @click.stop="handleClick">
            <i class="EventItem__icon" v-html="IconPlus" />
          </button>
        </div>
      </div>
      

    </div>
    
    <span class="EventItem__border -bottom" />
  </div>
</template>

<script setup lang="ts">
/**
 * UiKit - EventItem
 * 
 * Composant d'affichage d'un événement avec horaire, localisation et titre.
 * Émet un événement au clic pour ouvrir le panneau latéral.
 */

import IconPlus from 'assets/svg/plus.svg?raw'
import IconLocation from 'assets/svg/location.svg?raw'
interface EventItemProps {
  /** Horaire de l'événement */
  time: {
    start: string | null
    end: string | null
  } | null
  /** Titre de l'événement */
  title: string
  /** Localisation de l'événement */
  location?: string
  /** Données complètes de l'événement (passées au panneau) */
  event?: Record<string, unknown>
}

const props = withDefaults(defineProps<EventItemProps>(), {
  location: '',
  event: () => ({}),
})

const emit = defineEmits<{
  click: [event: Record<string, unknown>]
}>()

function handleClick() {
  emit('click', props.event)
}
</script>

<style lang="stylus" scoped>
.EventItem
  position relative
  width 100%
  cursor pointer
  transition background 0.2s ease
  
  &:hover
    background rgba($fjord, 0.03)
    
    .EventItem__icon
      transform rotate(90deg)

  &__border
    position absolute
    top 0
    left 0
    right 0
    height 1px
    background $fjord
    
    &.-bottom
      top auto
      bottom -1px

  &__content
    f(row, $justify: flex-start, $align: center)
    gap 140px
    align-items center
    padding 60px 0

  &__time
    r(min-width, 200px)
    margin-right 261px
    
  &__time-text
    f-style('subtitle')
    color $fjord

  &__info
    width 100%
    display flex
    flex-direction column
    gap 8px

  &__location
    color $fjord
    opacity 0.5
    display flex
    align-items center
    gap 10px
    f-style('default')
    .EventItem__icon_pin
      width 25px
      height 35px
      display flex
      --icon-accent white

  &__title-container
    f(row)
    align-items center

  &__title
    f-style('h5')
    margin-top 25px
    color $fjord

  &__action
    display flex
    align-items center
    justify-content center
    background none
    border none
    padding 0
    cursor pointer

  &__icon
    display flex
    align-items center
    justify-content center
    padding 24px
    width 80px
    height 80px
    flex-shrink 0
    transition transform 0.3s ease
    border-radius 50%
    background $fjord
    color white

    :deep(svg)
      width 100%
      height 100%
      
      path
        fill white
</style>

