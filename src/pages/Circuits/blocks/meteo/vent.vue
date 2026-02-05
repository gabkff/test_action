<template>
    <div class="vent">
        <div class="vent__title"> 
            <div class="vent__title__icon" v-html="IconWind"></div>
            {{ $t('meteo.vent') }}
        </div>
        <div class="vent__content" 
            v-if="currentVent" 
            :style="{ '--wind-direction': currentVent.direction }"
        >
            <div class="vent__content__img">
                <div class="vent__content__img__icon" v-html="IconCompass"/>
                <div class="vent__content__img__icon vent__content__img__icon__arrow" v-html="IconArrow"/>
            </div>
            <div class="vent__content__text">
                {{ currentVent.speed }}
            </div>
            <div class="vent__content__text__value">
                km/h
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { store as appStore } from 'plugins/store/app'
import { computed } from 'vue'
import IconWind from 'assets/svg/air.svg?raw'
import IconCompass from 'assets/svg/compass.svg?raw'
import IconArrow from 'assets/svg/arrow_compass.svg?raw'


const currentVent = computed(() => {
    if (!appStore.home?.weather) return null
    return appStore.home?.weather.wind_speed ? {
        speed: appStore.home?.weather.wind_speed,
        direction: appStore.home?.weather.wind_direction
    } : {
        speed: 11,
        direction: 45
    }
})
</script>
<style lang="stylus" scoped>
    .vent
        position relative
        width 25%
        f(column, $justify: stretch, $align: stretch)
        r(padding-top, 24px 16px)
        r(padding-bottom, 24px 16px)
        r(padding-left, 14px 14px)
        r(padding-right, 14px 14px)
        background-color white
        border-radius $radius-lg
        aspect-ratio 1 / 1 // Force un carré pour un cadran parfait
        +layout(mobile)
            border-radius 6px
            height 195px
        
        &__title
            opacity 0.5
            font-size 26px
            font-family $ff-text
            font-weight $fw-regular
            color $fjord
            f(row, $justify: flex-start, $align: center)
            r(gap, 15px)
            position relative
            z-index 10
            &:first-letter
                text-transform uppercase
            +layout(mobile)
                font-size 12px
                line-height 1.3
                font-weight $fw-bold

        &__title__icon
            r(size, 40px 18px)

        &__content
            position relative
            width 100%
            height 100%
            r(margin-top, 15px 7px)
            f(column, $justify: center, $align: center) // Centre le texte (11 km/h)

            &__img
                position absolute
                inset 0
                f(row, $justify: center, $align: center)

            &__img__icon
                position absolute
                width 100%
                height 100%
                z-index 1
                display flex
                :deep(svg)
                    width 100%
                    height 100%

            &__img__icon__arrow
                transform rotate(unquote('calc(var(--wind-direction) * 1deg)'))
                z-index 2
                trans(transform, 0.5s ease) // Animation fluide si le vent change
                :deep(svg)
                    margin auto
                    width 75%
                    height 100%

            &__text
                f-style('h4')
                color $fjord
                line-height 1
                position relative
                z-index 3
                +layout(mobile)
                    font-size 30px
                    line-height 1.2
                    font-weight $fw-bold

            &__text__value
                font-family $ff-text
                font-size 26px
                font-weight $fw-regular
                line-height 1.3
                color $fjord
                margin-top 5px
                position relative
                z-index 3
                +layout(mobile)
                    font-size 12px
                    line-height 1.3
                    font-weight $fw-regular
</style>