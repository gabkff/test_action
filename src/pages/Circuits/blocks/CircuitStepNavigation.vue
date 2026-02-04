<template>
  <div class="step-navigation" :data-view="view">
    <!-- Étape suivante -->
    <div class="step-navigation__card" v-if="hasNext">
      <div class="step-navigation__card-content">
        <div class="step-navigation__card-info">
          <div class="step-navigation__card-label">{{ $t('circuits.next_step') }}</div>
          <div class="step-navigation__card-title">{{ nextStepTitle }}</div>
        </div>
        <UiButton
          theme="secondary"
          :icon="IconArrow"
          :big="true"
          class="step-navigation__card-button step-navigation__card-button--next"
          :data-view="view"
          @click="$emit('next')"
        />
      </div>
      <div class="step-navigation__itinerary">
        <div class="step-navigation__itinerary-label">{{ $t('circuits.itinerary_time') }}</div>
        <UiTag
          :label="nextStepTime + ' min'"
          :icon="travelModeIcon"
          data-index="1"
          :data-view="view"
        />
      </div>
    </div>

    <!-- Étape précédente -->
    <div class="step-navigation__card" v-if="hasPrevious">
      <div class="step-navigation__card-content" :data-view="view">
        <div class="step-navigation__card-info">
          <div class="step-navigation__card-label">{{ $t('circuits.previous_step') }}</div>
          <div class="step-navigation__card-title">{{ previousStepTitle }}</div>
        </div>
        <UiButton
          theme="secondary"
          :icon="IconArrow"
          :big="true"
          class="step-navigation__card-button"
          :data-view="view"
          @click="$emit('previous')"
        />
      </div>
      <div class="step-navigation__itinerary">
        <div class="step-navigation__itinerary-label">{{ $t('circuits.itinerary_time') }}</div>
        <UiTag
          :label="previousStepTime + ' min'"
          :icon="travelModeIcon"
          data-index="1"
          :data-view="view"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiTag from 'components/UiKit/Tag/index.vue'
import { UiButton } from '@/components/UiKit'
import IconArrow from 'assets/svg/arrow.svg?raw'
import IconWalk from 'assets/svg/walk.svg?raw'
import IconCar from 'assets/svg/car.svg?raw'
import IconBike from 'assets/svg/bike.svg?raw'

type ViewType = 'map' | 'list'

interface Props {
  view: ViewType
  hasNext: boolean
  hasPrevious: boolean
  nextStepTitle?: string
  nextStepTime?: number
  previousStepTitle?: string
  previousStepTime?: number
  travelMode?: string
}

const props = withDefaults(defineProps<Props>(), {
  hasNext: false,
  hasPrevious: false,
  travelMode: 'WALK'
})

defineEmits<{
  next: []
  previous: []
}>()

const travelModeIcon = computed(() => {
  switch (props.travelMode) {
    case 'WALK':
      return IconWalk
    case 'DRIVE':
      return IconCar
    case 'BIKE':
      return IconBike
    default:
      return IconWalk
  }
})
</script>

<style lang="stylus" scoped>
.step-navigation
  f(column, $justify: flex-start)
  gap 20px
  width 838px

  &[data-view="map"]
    position absolute
    left -110%
    top 0

    .step-navigation__card
      color $fjord
      border 1px solid rgba($fjord, 0.5)

      .UiButton
        background-color $embruns
        color $fjord
        border 1px solid rgba($fjord, 0.5)

      .step-navigation__itinerary-label
        color $fjord

      .UiTag
        color $fjord !important
        border-color rgba($fjord, 0.5) !important

  &__card
    color white
    padding 30px
    border solid 2px rgba($light, .5)
    border-radius 12px

  &__card-content
    f(row, $justify: space-between, $align: flex-start)
    margin-bottom 60px

    .UiButton
      r(width, 128px)
      r(height, 120px)
      border 1px solid rgba($light, .5)

      :deep(.UiButton__icon)
        transform rotate(180deg)

    &[data-view="map"]
      color $fjord

  &__card-button--next
    :deep(.UiButton__icon)
      transform rotate(0deg) !important

  &__card-info
    f(column, $justify: flex-start)
    gap 15px

  &__card-title
    f-style('subtitle')
    margin-right 15px

  &__card-label
    f-style('small-body')

  &__itinerary
    .UiTag
      color white
      border-color rgba($light, .5)

      &:not(:last-child)
        margin-right 15px

  &__itinerary-label
    f-style('small-text')
    color white
    margin-bottom 15px
</style>
