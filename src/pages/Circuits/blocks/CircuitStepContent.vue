<template>
  <div class="step-content">
    <div class="step-content__header">
      <ui-button theme="icon" :icon="step.icon" />
      <div class="step-content__step-total">
        {{ $t('circuits.step_total', { number: stepNumber, total: totalSteps }) }}
      </div>
    </div>
    <h2 class="step-content__title">{{ step.title }}</h2>
    <div class="step-content__description">
      <p>{{ step.description }}</p>
    </div>
    <div class="step-content__itinerary" v-if="showItinerary && commuting.length > 0">
      <div class="step-content__itinerary-label">{{ $t('circuits.from_here') }}</div>
      <UiTag
        v-for="(item, index) in commuting"
        :key="index"
        :label="item.time + 'min'"
        :icon="getTransportIcon(item.transportation)"
      />
    </div>
    <ui-button
      theme="secondary"
      :label="$t('circuits.more')"
      :big="true"
      :icon="IconPlus"
      :iconPosition="'right'"
      class="step-content__see-more"
      @click="$emit('more')"
    />
  </div>
</template>

<script setup lang="ts">
import UiTag from 'components/UiKit/Tag/index.vue'
import { UiButton } from '@/components/UiKit'
import IconPlus from 'assets/svg/plus.svg?raw'
import IconWalk from 'assets/svg/walk.svg?raw'
import IconCar from 'assets/svg/car.svg?raw'
import IconBike from 'assets/svg/bike.svg?raw'

interface Props {
  step: CircuitStep
  stepNumber: number
  totalSteps: number
  commuting: Array<{ time: number; transportation: string }>
  showItinerary?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showItinerary: false
})

defineEmits<{
  more: []
}>()

function getTransportIcon(transportation: string): string {
  switch (transportation) {
    case 'WALK':
      return IconWalk
    case 'DRIVE':
      return IconCar
    case 'BIKE':
      return IconBike
    default:
      return IconWalk
  }
}
</script>

<style lang="stylus" scoped>
.step-content
  f(column, $justify: flex-start)
  height 100%
  flex 1

  &__header
    f(row, $justify: flex-start)
    margin-bottom 20px

  &__step-total
    f-style('subtitle')
    color $fjord
    margin-left 40px

  &__title
    f-style('h5')
    color $fjord
    margin-bottom 30px

  &__description
    f-style('default')
    color $fjord
    margin-bottom 60px

  &__itinerary
    .UiTag
      color $fjord
      border-color rgba($fjord, 0.5)
      &:not(:last-child)
        margin-right 15px

  &__itinerary-label
    f-style('small-body')
    color $fjord
    opacity 0.5
    margin-bottom 20px

  &__see-more
    width 100%
    margin-top auto
</style>
