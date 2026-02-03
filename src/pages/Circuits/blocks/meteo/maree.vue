<template>
    <div class="maree">
        <div class="maree__title">
            <div class="maree__title__icon" v-html="IconMaree"></div>
            <span class="maree__title__text">{{ $t('meteo.maree') }}</span>
        </div>
        <div class="maree__content_text">
            <div class="maree__content_text__title">
                {{ currentMaree?.next_event_type === 'HIGH TIDE' ? $t('meteo.next_high_tide') : $t('meteo.next_low_tide') }}
            </div>
            <div class="maree__content_text__value">
                {{ currentMaree?.next_event_timestamp ? new Date(currentMaree?.next_event_timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'XX:XX' }}
            </div>
        </div>
        <div class="maree__content_line">
            <div
                class="maree__content_line__line"
                :style="lineStyle"
                v-html="IconLine"
                :data-high="currentMaree?.next_event_type === 'HIGH TIDE'"
            ></div>
            <div class="maree__content_line__arrow" v-html="IconArrow" :high="currentMaree?.next_event_type === 'HIGH TIDE'"></div>
        </div>
        <div class="maree__content_next_maree">
            <span class="maree__content_next_maree__title">
                {{ currentMaree?.previous_event_type === 'HIGH TIDE' ? $t('meteo.high_tide') : $t('meteo.low_tide') }}
            </span>
            <div class="maree__content_next_maree__line" v-html="IconArrowLeft"></div>
            <span class="maree__content_next_maree__value">{{ currentMaree?.previous_event_timestamp ? new Date(currentMaree?.previous_event_timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'XX:XX' }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import IconMaree from 'assets/svg/summit.svg?raw'
import IconArrow from 'assets/svg/big_line.svg?raw'
import IconArrowLeft from 'assets/svg/small_arrow.svg?raw'
import IconLine from 'assets/svg/tide.svg?raw'
import { store as appStore } from 'plugins/store/app'
import { computed } from 'vue'

const currentMaree = computed(() => {
    if (!appStore.home?.tides) return null
    return appStore.home?.tides
})

/** Fenêtre de temps avant la prochaine marée pour le calcul de la position (en secondes) */
const FENETRE_AVANT_MAREE = 6 * 60 * 60
/** Seuil en secondes en dessous duquel on considère qu'on est "proche" de la prochaine marée */
const SEUIL_PROCHE = 60 * 60

const lineStyle = computed(() => {
    const next = currentMaree.value?.next_event_timestamp
    if (next == null) return { '--tide-position': 0, '--tide-proche': 0 }

    const now = Date.now() / 1000
    const timeUntilNext = next - now

    const position = Math.max(
        0,
        Math.min(1, 1 - timeUntilNext / FENETRE_AVANT_MAREE),
    )
    const isProche = timeUntilNext > 0 && timeUntilNext <= SEUIL_PROCHE ? 1 : 0

    return {
        '--tide-position': position,
        '--tide-proche': isProche,
    }
})
</script>

<style lang="stylus" scoped>
    .maree
        r(padding-top, 24px)
        r(padding-bottom, 24px)
        background-color white
        &__title__icon
            r(size, 40px)
            color $fjord
        &__title
            padding-left 30px
            padding-right 30px
            opacity 0.5
            font-size 26px
            font-family $ff-text
            font-weight $fw-regular
            line-height 1.3
            color $fjord
            f(row, $justify: flex-start, $align: center)
            r(gap, 15px)
            &__text
                &:first-letter
                    text-transform uppercase
        &__content_text
            margin-top 15px
            padding-left 30px
            padding-right 30px
            f(column, $justify: flex-start, $align: center)
            color $fjord
            &__title
                font-family $ff-text
                font-weight $fw-regular
                line-height 1.3
                font-size 26px
            &__value
                font-family $ff-text
                font-weight $fw-bold
                line-height 1.2
                font-size 64px
        &__content_line
            width 100%
            position relative
            display flex
            height 152px
            &__line
                padding-top 30px
                width 100%
                padding-bottom 30px
                position relative
                :deep(svg)
                    width 100%
                    height 100%
                &[data-high="false"]
                    :deep(svg)
                        transform rotate(180deg)
                    &::after
                        top unquote('calc(40% + var(--tide-position) * 40%)')
                &::after
                    content ''
                    position absolute
                    left unquote('calc(var(--tide-position) * 50%)')
                    top unquote('calc(80% - var(--tide-position) * 40%)')
                    transform translate(-50%, -50%)
                    size 28px
                    background-color white
                    border-radius 50%
                    border 5px solid $fleuve
                    box-sizing border-box
        &__content_line__arrow
            position absolute
            left 50%
            &[high="false"]
                top 50%
        &__content_next_maree
            padding-left 30px
            padding-right 30px
            font-size 26px
            font-family $ff-text
            font-weight $fw-regular
            line-height 1.3
            color $fjord
            gap 5px
            f(row, $justify: flex-start, $align: center)
            &__line
                r(width, 33px)
                :deep(svg)
                    width 100%
                    height 100%
</style>