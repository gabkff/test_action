<template>
    <div class="menu-page">
        <div class="menu-page__top_part">
            <div class="menu-page__left_part">
            <div class="menu-page__left_part__dyk">
                <div class="menu-page__left_part__dyk__icon" v-html="IconMind"></div>
                <div class="menu-page__left_part__dyk__content">
                    <div class="menu-page__left_part__dyk__content__title">{{ $t('did_you_know.title') }}</div>
                    <span class="menu-page__left_part__dyk__content__text">
                        {{ appStore.home?.inspirational_text }}
                    </span>
                </div>
            </div>
            <div class="menu-page__left_part__event" v-if="nextEvent">
                <div class="menu-page__left_part__event__title">
                    {{  nextEventDate ?? '' }}
                </div>
                <div class="menu-page__left_part__event__content">
                    <ui-picture :images="nextEvent.main_image.images" :cover="'cover'" v-if="nextEvent"/>
                    <div class="menu-page__left_part__event__content__overlay">
                        <div class="menu-page__left_part__event__content__heure">
                            <template v-if="nextEvent?.time_start && nextEvent?.time_end && nextEvent.time_start !== nextEvent.time_end && nextEvent.time_start !== '00:00' && nextEvent.time_end !== '00:00'">
                                <span class="EventItem__time-text">
                                    {{ $t('events.time_start_end', { start: nextEvent.time_start, end: nextEvent.time_end }) }}
                                </span>
                            </template>
                            <template v-else>
                                <span>{{ nextEvent?.time_start|| nextEvent?.time_end }} </span>
                            </template>
                        </div>
                        <div class="menu-page__left_part__event__content__title">
                            {{ nextEvent?.title ?? $t('events.no_event') }}
                        </div>
                        <div class="menu-page__left_part__event__content__button">
                            <ui-button :label="$t('events.see_all')" :icon="IconPlus" iconPosition="right" @click="router.push(`/evenements`)" />
                        </div>
                    </div>
                </div>
            </div>
            
            </div>
            <div class="menu-page__right_part">
                <div class="menu-page__right_part__follow">
                    <div class="menu-page__right_part__follow__title"> {{ $t('menu.follow', { account: appStore.home?.instagram_account }) }}</div>
                    <div class="menu-page__right_part__follow__icon" v-html="IconInstagram"></div>
                </div>
                <div class="menu-page__right_part__circuits">
                    <template v-if="isDesktop">
                        <div class="menu-page__right_part__circuits__title"> {{ $t('menu.discover') }}</div>
                        <div class="menu-page__right_part__circuit"
                            v-for="(circuit, circuitIndex) in appStore.circuits.filter(circuit => circuit.id !== Number(route.params.id))"
                            :key="circuit.id"
                            :data-circuit-theme="getCircuitIndex(circuit.id)"
                        >
                        <ui-picture v-if="circuit.image" :images="circuit.image.images" :cover="'cover'" />
                        <div class="menu-page__right_part__circuit__content">
                            <div class="menu-page__right_part__circuit__content__title" :data-circuit-theme="getCircuitIndex(circuit.id)"> {{ circuit.title }}</div>
                            <div class="menu-page__right_part__circuit__content_text_action" :data-circuit-theme="getCircuitIndex(circuit.id)">
                                <ui-tag :label="$t('circuits.total_step', { number: circuit.steps.length })" />
                                <ui-button theme="primary" :label="$t('common.link_discover')" :icon="IconPlus" :iconPosition="'right'"
                                @click="router.push(`/circuits/${circuit.id}`)"
                                />
                            </div>
                        </div>


                        </div>
                    </template>
                    <div class="menu-page__right_part__circuits__mobile" v-else>
                        <div class="menu-page__right_part__circuits__mobile__header">
                            <div class="menu-page__right_part__circuits__title"> {{ $t('menu.discover') }}</div>
                        </div>
                        <div class="menu-page__right_part__circuits__mobile__circuit_wrapper">
                            <ui-swiper :options="{ slidesPerView: 'auto', spaceBetween: 15, centeredSlides: false }" :overflow="true" :navigation="true">
                            
                                <div class="menu-page__right_part__circuit menu-page__right_part__circuit__mobile"
                                    v-for="(circuit, circuitIndex) in appStore.circuits.filter(circuit => circuit.id !== Number(route.params.id))"
                                    :key="circuit.id"
                                    :data-circuit-theme="getCircuitIndex(circuit.id)"
                                >
                                    <ui-picture v-if="circuit.image" :images="circuit.image.images" :cover="'cover'" />
                                    <div class="menu-page__right_part__circuit__content">
                                        <div class="menu-page__right_part__circuit__content__title" :data-circuit-theme="getCircuitIndex(circuit.id)"> {{ circuit.title }}</div>
                                        <div class="menu-page__right_part__circuit__content_text_action" :data-circuit-theme="getCircuitIndex(circuit.id)">
                                            <ui-tag :label="$t('circuits.total_step', { number: circuit.steps.length })" />
                                            <ui-button theme="primary" :label="$t('common.link_discover')" :icon="IconPlus" :iconPosition="'right'"
                                                @click="router.push(`/circuits/${circuit.id}`)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ui-swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template v-if="isDesktop">
            <div class="menu-page__part_meteo">
                <div class="menu-page__part_meteo__title"> {{ $t('meteo.condition_meteo') }}</div>
                <div class="menu-page__part_meteo__content"> 
                    <condition /> 
                    <vent />
                    <temperature /> 
                    <maree/>
                </div>
            </div>
            <div class="menu-page__sponsor">
                <sponsor :left="true" />
                <sponsor :left="false" />
            </div>
        </template>
        <div v-else class="wrapper_meteo_sponsor">
            <div class="menu-page__part_meteo">
                <div class="menu-page__part_meteo__title"> {{ $t('meteo.condition_meteo') }}</div>
                <ui-swiper :options="{ slidesPerView: 2, spaceBetween: 20, centeredSlides: false }" :overflow="true" :navigation="true">
                    <condition /> 
                    <vent />
                    <temperature /> 
                    <maree/>
                </ui-swiper>
            </div>
            <div class="menu-page__sponsor">
                <sponsor :left="true" />
            </div>
        </div>
    </div>
  </template>
  
  <script setup lang="ts">
    import { computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import IconMind from 'assets/svg/mind.svg?raw'
    import IconPlus from 'assets/svg/plus.svg?raw'
    import IconInstagram from 'assets/svg/instagram.svg?raw'
    import Condition from './meteo/condition.vue'
    import Sponsor from './sponsor.vue'
    import Vent from './meteo/vent.vue'
    import Temperature from './meteo/temperature.vue'
    import Maree from './meteo/maree.vue'
    import UiTag from 'components/UiKit/Tag/index.vue'
    import { store as appStore } from 'plugins/store/app'
    import { store as interfaceStore } from 'plugins/store/interface'
    import { useNextEvent } from 'plugins/utils'

    const route = useRoute()
    const router = useRouter()

    // Utilise le composable pour récupérer le prochain événement
    const nextEventData = useNextEvent()
    const isDesktop = computed(() => interfaceStore.isDesktop)
    // Raccourcis pour le template (conserve la même API que l'ancien code)
    const nextEvent = computed(() => nextEventData.value?.event ?? null)
    const nextEventDate = computed(() => nextEventData.value?.label ?? '')

    const getCircuitIndex = (id: number) => {
        return appStore.getCircuitIndex(id)
    }
  </script>
  
  <style lang="stylus" scoped>
  .menu-page
    position relative
    r(margin-left, 230px 93px)
    r(margin-right, 230px 93px)
    r(margin-top, 60px 30px)
    r(margin-bottom, 356px 90px)
    f(column, $justify: flex-start)
    &__top_part
        f(row, $justify: flex-start, $align: flex-start)
        r(gap, 84px 43px)
    &__left_part,
    &__right_part
      width 50%
      f(column, $justify: flex-start)
    &__sponsor
        r(margin-top, 73px)
        f(row, $justify: flex-start, $align: stretch)
        r(gap, 45px)
    &__left_part__dyk
        r(width, 828px 393px)
        r(padding-left, 60px 28px)
        r(padding-right, 60px 28px)
        r(padding-top, 45px 21px)
        r(padding-bottom, 45px 21px)
        background-color white
        r(border-radius, $radius-lg 6px)
        f(row, $justify: flex-start, $align: center)
        r(gap, 60px 28px)
        &__icon
            r(size, 168px 80px)
            color $fjord
        &__content
            f(column, $justify: flex-start)
            r(gap, 15px 7px)
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
                +layout(mobile)
                    font-size 14px
                    line-height 1.3
                    font-weight $fw-medium
            &__text
                f-style('default')
                +layout(mobile)
                    font-size 17px
                    line-height 1.4
                    font-weight $fw-medium
    &__left_part__event
        r(margin-top, 133px 47px)
        &__title
            f-style('h5')
            color $fjord
            r(margin-bottom, 45px 20px)
            +layout(mobile)
                font-size 23px
                line-height 1.1
                font-weight $fw-bold
        &__content
            r(min-height, 693px 224px)
            height 100%
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
                r(margin-bottom, 19px 9px)
                +layout(mobile)
                    font-size 14px
                    line-height 1.3
                    font-weight $fw-medium
            &__title
                f-style('h5')
                r(margin-bottom, 49px 23px)
                +layout(mobile)
                    font-size 23px
                    line-height 1.1
                    font-weight $fw-bold
            &__overlay
                r(padding, 30px)
                border-radius $radius-lgxl
                background-image linear-gradient(0deg,rgba(0, 0, 0, .7) 0%, rgba(0, 0, 0, .7) 100%)
                z-index 2
                width 100%
                height 100%
                flex 1
                f(column, $justify: flex-end, $align: flex-start)
    &__part_meteo
        r(margin-top, 103px 47px)
        r(height, 412px 250px)
        &__title
            f-style('h5')
            color $fjord
            r(margin-bottom, 45px 23px)
            +layout(mobile)
                font-size 23px
                line-height 1.1
                font-weight $fw-bold
        &__content
            f(row, $justify: flex-start, $align: stretch)
            r(gap, 44px)
            > *
                flex 1 1 0
                min-width 0
                height 412px
    &__container
      r(margin-left, 230px)
      r(margin-right, 230px)
      r(margin-top, 267px)
      r(margin-bottom, 356px)
    &__right_part__follow
        background white
        r(padding, 45px 20px)
        border-radius $radius-lg
        f(row, $justify: space-between, $align: flex-start)
        r(gap, 30px 15px)
        +layout(mobile)
            border-radius 6px
    &__right_part__follow__title
        f-style('default')
        +layout(mobile)
            font-size 17px
            line-height 1.4
            font-weight $fw-medium
    &__right_part__follow__icon
        r(size, 65px 30px)
    &__right_part__circuits
        width 100%
        r(margin-top, 117px 70px)
        f(column, $justify: flex-start, $align: flex-start)
    &__right_part__circuits__mobile__circuit_wrapper
        f(row, $justify: flex-start, $align: flex-start)
        r(gap, 25px)
        overflow hidden
    &__right_part__circuits__title
        f-style('h5')
        color $fjord
        r(margin-bottom, 60px)
        &:first-letter
            text-transform uppercase
    &__right_part__circuit
        width 100%
        f(row, $justify: flex-start, $align: flex-start)
        r(margin-bottom, 30px)
        r(gap, 25px 10px)
        r(height, 470px 223px)
        border-radius $radius-lgxl
        r(padding, 10px 5px)
        background-color $fjord
        +layout(mobile)
            border-radius 6px
            width 388px
        :deep(.UiPicture)
            flex 1
            height 100%
        &[data-circuit-theme="1"]
            background-color $penombre
        &[data-circuit-theme="2"]
            background-color $epinette
    &__right_part__circuit__mobile
        min-height 300px
        height 100%
        width 100%
        border-radius 6px
        background-color $fjord
        r(padding, 5px 5px)
        :deep(.UiPicture)
            height 100%
            width 100%
    &__right_part__circuit__content
        flex 1
        f(column, $justify: space-between, $align: flex-start)
        height 100%
        r(margin-right, 20px)
    &__right_part__circuit__content__title
        font-family $ff-title
        font-size 75px
        line-height 1.1
        font-weight $fw-extrabold
        color $aube
        &[data-circuit-theme="1"]
            color $crepuscule
        &[data-circuit-theme="2"]
            color $bouleau
        +layout(mobile)
            font-size 45px
            line-height 1.1
            font-weight $fw-extrabold
    &__right_part__circuit__content_text_action
        f(row, $justify: space-between, $align: center)
        r(gap, 14px)
        margin-top auto
        r(margin-bottom, 20px)
        align-self flex-end
        :deep(.UiTag)
            border 1px solid rgba(#f8f3ff, 0.5)
        &[data-circuit-theme="1"]
            :deep(.UiButton)
                background-color $ecume
                color $epinette
        &[data-circuit-theme="2"]
            :deep(.UiButton)
                background-color $aurore
                color $penombre
.wrapper_meteo_sponsor
  f(row, $justify: space-between, $align: flex-start)
  r(gap, 45px)
  .menu-page__part_meteo
    overflow hidden
    width 50%
  .menu-page__sponsor
    width 50%
  </style>