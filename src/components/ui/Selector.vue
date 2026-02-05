<template>
  <div :class="['UiSelector', `UiSelector--${theme}`]">
    <!-- Indicateur animé (fond qui slide) -->
     <div class="UiSelector__container">
        <span 
        class="UiSelector__indicator" 
        :style="indicatorStyle"
        />
        
        <!-- Options -->
        <button
        v-for="(option, index) in options"
        :key="option.value"
        :class="['UiSelector__option', { 'is-active': modelValue === option.value }]"
        type="button"
        @click="selectOption(option.value)"
        >
        <div v-if="option.icon" class="UiSelector__icon-container">
            <i 
                
                class="UiSelector__icon" 
                v-html="option.icon" 
            />
        </div>
        <span v-if="option.label" class="UiSelector__label">
            {{ option.label }}
        </span>
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * UiSelector
 * 
 * Composant de sélection avec animation de sliding.
 * Supporte texte, icônes ou les deux.
 */

import { computed } from 'vue'

export interface SelectorOption {
  /** Valeur de l'option */
  value: string | number
  /** Label texte (optionnel) */
  label?: string
  /** Icône SVG raw (optionnel) */
  icon?: string
}

type SelectorTheme = 'primary' | 'secondary'

interface SelectorProps {
  /** Valeur sélectionnée */
  modelValue: string | number
  /** Liste des options */
  options: SelectorOption[]
  /** Thème du selector */
  theme?: SelectorTheme
}

const props = withDefaults(defineProps<SelectorProps>(), {
  theme: 'primary',
})

const emit = defineEmits<{
  /** Mise à jour du v-model */
  'update:modelValue': [value: string | number]
  /** Événement émis lors du changement de sélection */
  'change': [value: string | number, option: SelectorOption]
}>()

/** Index de l'option active */
const activeIndex = computed(() => {
  return props.options.findIndex(opt => opt.value === props.modelValue)
})

/** Style de l'indicateur (position calculée) */
const indicatorStyle = computed(() => {
  const count = props.options.length
  return {
    width: `${100 / count}%`,
    transform: `translateX(${activeIndex.value * 100}%)`
  }
})

/** Sélectionner une option */
function selectOption(value: string | number) {
  if (value !== props.modelValue) {
    const option = props.options.find(opt => opt.value === value)
    emit('update:modelValue', value)
    if (option) {
      emit('change', value, option)
    }
  }
}
</script>

<style lang="stylus" scoped>
.UiSelector
  position relative
  display inline-flex
  border-radius $radius-lg
  r(padding, 8px 4px)
  r(height, 80px 45px)
  r(width, 370px 180px)
  gap 0
  +layout(mobile)
    border-radius 4px
    padding 

  .UiSelector__container
    f(row, $align: center)
    position relative
    width 100%

  &__indicator
    height 100%
    position absolute
    top 0px
    left 0px
    border-radius $radius-md
    transition transform 0.3s ease
    pointer-events none

  &__option
    position relative
    z-index 1
    display flex
    align-items center
    justify-content center
    width 100%
    r(gap, 8px 4px)
    padding 15px
    background none
    border none
    cursor pointer
    transition color 0.3s ease
    f-style('btn-medium')
    +layout(mobile)
      font-size 12px
      padding 0px

  &__icon-container
    r(size, 50px 23px)
    r(padding, 8px 0px)
    display flex
    align-items center
    justify-content center

  &__icon
    :deep(svg)
      width 100%
      height 100%
      
      path
        transition fill 0.3s ease

  &__label
    white-space nowrap

  // Theme Primary (default)
  &--primary
    background white

    .UiSelector__indicator
      background $fjord

    .UiSelector__option
      color $fjord
      --icon-accent white

      &.is-active
        color #DCF2F0
        --icon-accent $fjord 

  // Theme Secondary
  &--secondary
    background $aube

    .UiSelector__indicator
      background $fjord

    .UiSelector__option
      color $fjord
      --icon-accent $aube 

      &.is-active
        color $aube
        --icon-accent $fjord
</style>
