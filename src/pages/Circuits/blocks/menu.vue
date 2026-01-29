<template>
    <div class="menu-page">
        <div class="menu-page__left_part">
            <div class="menu-page__left_part__dyk">
                <div class="menu-page__left_part__dyk__icon" v-html="IconMind"></div>
                <div class="menu-page__left_part__dyk__content">
                    <div class="menu-page__left_part__dyk__content__title">{{ $t('did_you_know.title') }}</div>
                    <span class="menu-page__left_part__dyk__content__text">
                        {{ $t('did_you_know.text') }}
                    </span>
                </div>
            </div>
            <div class="menu-page__left_part__event" v-if="nextEvent">
                <div class="menu-page__left_part__event__title">
                    {{  nextEventDate }}
                </div>
                <div class="menu-page__left_part__event__content">
                    <ui-picture :images="nextEvent.main_image.images" :cover="'cover'" />
                    <div class="menu-page__left_part__event__content__overlay">
                        <div class="menu-page__left_part__event__content__heure">
                            <template v-if="nextEvent.time_start && nextEvent.time_end && nextEvent.time_start !== nextEvent.time_end && nextEvent.time_start !== '00:00' && nextEvent.time_end !== '00:00'">
                                <span class="EventItem__time-text">
                                    {{ $t('events.time_start_end', { start: nextEvent.time_start, end: nextEvent.time_end }) }}
                                </span>
                            </template>
                            <template v-else>
                                <span>{{ nextEvent.time_start|| nextEvent.time_end }} </span>
                            </template>
                        </div>
                        <div class="menu-page__left_part__event__content__title">
                            {{ nextEvent.title }}
                        </div>
                        <div class="menu-page__left_part__event__content__button">
                            <ui-button :label="$t('events.see_all')" :icon="IconPlus" iconPosition="right" @click="router.push(`/evenements`)" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="menu-page__left_part__meteo">
                <div class="menu-page__left_part__meteo__title"> {{ $t('meteo.condition_meteo') }}</div>
                <div class="menu-page__left_part__meteo__content"> 
                    <condition /> 
                    <vent />
                </div>
            </div>
        </div>
        <div class="menu-page__right_part">
            LE COTE DROITE
        </div>
    </div>
  </template>
  
  <script setup lang="ts">
    import IconMind from 'assets/svg/mind.svg?raw'
    import IconPlus from 'assets/svg/plus.svg?raw'
    import Condition from './meteo/condition.vue'
    import Vent from './meteo/vent.vue'
    import { store as appStore } from 'plugins/store/app'
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import i18n from 'plugins/i18n'

    const router = useRouter()
    const nextEvent = computed(() => {
        if (appStore.events.length === 0) return null
        if (appStore.events.length === 1) return appStore.events[0]
        const today = Date.now() / 1000
        const nextEvent = appStore.events.find(event => event.datetime_start_timestamp > today)
        if (!nextEvent) return appStore.events[0]
        return null
    })

    const nextEventDate = computed(() => {
        if (!nextEvent.value) return null
        const date = new Date(nextEvent.value.datetime_start_timestamp * 1000)
        const today = new Date()
        if (date.getDay() === today.getDay() && date.getMonth() === today.getMonth()) {
            return i18n.global.t('events.today', { date: date.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }) })
        }
        return date.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })
    })
  
  </script>
  
  <style lang="stylus" scoped>
  .menu-page
    position relative
    r(margin-left, 230px)
    r(margin-right, 230px)
    r(margin-top, 60px)
    r(margin-bottom, 356px)
    f(row, $justify: flex-start)
    &__left_part,
    &__right_part
      width 50%
      f(column, $justify: flex-start)
    &__left_part__dyk
        r(width, 828px)
        r(padding-left, 60px)
        r(padding-right, 60px)
        r(padding-top, 45px)
        r(padding-bottom, 45px)
        background-color white
        border-radius $radius-lg
        f(row, $justify: flex-start, $align: center)
        r(gap, 60px)
        &__icon
            r(size, 168px)
            color $fjord
        &__content
            f(column, $justify: flex-start)
            r(gap, 15px)
            &__title
                f-style('h5')
                color $fjord
            &__content
                f-style('default')
        &__content
            f(column, $justify: flex-start, $align: flex-start)
            r(gap, 15px)
            &__title
                f-style('small-body')
                color rgba($fjord, 0.5)
            &__text
                f-style('default')
    &__left_part__event
        r(margin-top, 133px)
        &__title
            f-style('h5')
            color $fjord
            r(margin-bottom, 45px)
        &__content
            r(height, 693px)
            f(column, $justify: flex-start, $align: flex-start)
            r(gap, 15px)
            color $ecume
            position relative
            :deep(.UiPicture)
                position absolute
                top 0
                left 0
                height 100%
            &__heure
                f-style('small-body')
                r(margin-bottom, 19px)
            &__title
                f-style('h5')
                r(margin-bottom, 49px)
            &__overlay
                r(padding, 30px)
                border-radius $radius-lgxl
                background-image linear-gradient(0deg,rgba(0, 0, 0, .7) 0%, rgba(0, 0, 0, .7) 100%)
                z-index 2
                width 100%
                height 100%
                f(column, $justify: flex-end, $align: flex-start)
    &__left_part__meteo
        r(margin-top, 103px)
        r(height, 412px)
        &__title
            f-style('h5')
            color $fjord
            r(margin-bottom, 45px)
        &__content
            f(row, $justify: flex-start, $align: stretch)
            r(gap, 44px)
    &__background
      position absolute
      top 35%
      left 0
      color rgba($fjord, 0.3)
    &__container
      r(margin-left, 230px)
      r(margin-right, 230px)
      r(margin-top, 267px)
      r(margin-bottom, 356px)
  </style>