<template>
    <div class="condition">
        <div class="condition__title"> 
            <div class="condition__title__icon" v-html="IconCloudy"></div>
            {{ $t('meteo.condition') }}
        </div>
        <div class="condition__content" v-if="currentCondition">
            <div class="condition__content__img">
                <img :src="currentCondition.img" alt="Condition" />
            </div>
            <div class="condition__content__text">
                {{ currentCondition.text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { store as appStore } from 'plugins/store/app'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import IconCloudy from 'assets/svg/cloudy.svg?raw'
import ImgCloud from './img/cloud.png'
import ImgFog from './img/fog.png'
import ImgRain from './img/rain.png'
import ImgSnow from './img/snow.png'
import ImgSun from './img/sun.png'
import ImgSunCloud from './img/sun&Cloud.png'
import ImgSunRain from './img/sun&Rain.png'
import ImgThunderRain from './img/thunder&Rain.png'
import ImgThunder from './img/thunder.png'
const { t } = useI18n()

const currentCondition = computed(() => {
    if (!appStore.home?.weather) return { img: ImgFog, text: null }
    switch (appStore.home?.weather.wmo_code) {
        case 0:
            return { img: ImgSun, text: t('meteo.sun') }
        case 1:
        case 2:
            return { img: ImgSunCloud, text: t('meteo.sun_cloud') }
        case 51:
            return { img: ImgSunRain, text: t('meteo.sun_rain') }
        case 3:
            return { img: ImgCloud, text: t('meteo.cloud') }
        case 5:
        case 6:
        case 8:
            return { img: ImgRain, text: t('meteo.rain') }
        case 95:
            return { img: ImgThunder, text: t('meteo.thunder') }
        default:
            return { img: ImgThunderRain, text: t('meteo.thunder_rain') }
    }
})
</script>
<style lang="stylus" scoped>
    .condition
        r(padding-top, 24px)
        r(padding-bottom, 24px)
        r(padding-left, 14px)
        r(padding-right, 14px)
        background-color white
        border-radius $radius-lg
        width 50%
        &__title
            opacity 0.5
            font-size 26px
            font-family $ff-text
            font-weight $fw-regular
            line-height 1.3
            color $fjord
            f(row, $justify: flex-start, $align: center)
            r(gap, 15px)
        &__title__icon
            r(size, 40px)
        &__content
            f(column, $justify: flex-start, $align: flex-start)
            r(gap, 30px)
            &__img
                margin auto
            &__text
                font-size 26px
                line-height 1.3
                font-family $ff-text
                font-weight $fw-regular
</style>