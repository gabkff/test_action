<template>
    <div class="temperature">
        <div class="temperature__title">
            <div class="temperature__title__icon" v-html="IconThermostat"></div>
            <span class="temperature__title__text">{{ $t('meteo.temperature') }}</span>
        </div>
        <div class="temperature__content">
            <div class="temperature__content__temperature">
                {{ currentWeather?.temp }}°
            </div>
            <UiSelector
                v-model="currentTemp"
                :options="[
                { value: 'celsius', label: 'C' },
                { value: 'farhrenheit', label: 'F' }
                ]"
                @change="(value) =>onViewChange(value as string)"
            />
        </div>
        <div class="temperature__content__sensation">
            <div class="temperature__content__sensation__title">
                {{ currentWeather?.ressenti}}° {{ (currentTemp === 'celsius' ? 'C' : 'F' )}} {{ $t('meteo.ressenti') }}
            </div>
            <div class="temperature__content__sensation__text">
                {{ $t('meteo.sensation') }}
            </div>
        </div>
        <div
            class="temperature__content__line"
            :style="lineStyle"
        ></div>
    </div>
</template>
<script setup lang="ts">
    import UiSelector from 'components/ui/Selector.vue'
    import IconThermostat from 'assets/svg/thermostat.svg?raw'
    import { ref, computed } from 'vue'
    import { store as appStore } from 'plugins/store/app'
    const currentTemp = ref('celsius')
    const onViewChange = (value: string) => {
        currentTemp.value = value
    }
    const currentWeather = computed(() => {
        if (!appStore.home?.weather) return null
        if (currentTemp.value === 'celsius') {
            return {
                temp: appStore.home?.weather.current_temperature,
                ressenti: appStore.home?.weather.apparent_temperature
            }
        } else {
            return {
                temp: celsiusToFahrenheit(appStore.home?.weather.current_temperature),
                ressenti: celsiusToFahrenheit(appStore.home?.weather.apparent_temperature)
            }
        }
    })
    const TEMP_MIN = -20
    const TEMP_MAX = 40

    function celsiusToFahrenheit(celsius: number): number {
        return Number(((celsius * 9) / 5 + 32).toFixed(2))
    }

    // Couleurs du dégradé (alignées avec colors.styl)
    const GRADIENT_COLORS = {
        low: '#00DEC4',   // $fleuve 0%
        mid: '#FFBC47',   // $bouleau 50%
        high: '#FF8D66',  // $crepuscule 100%
    }

    function temperatureToPercent(temp: number | undefined): number {
        if (temp == null || typeof temp !== 'number') return 50
        const percent = ((temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100
        return Math.max(0, Math.min(100, percent))
    }

    function hexToRgb(hex: string): [number, number, number] {
        const n = hex.replace('#', '')
        return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
    }

    function rgbToHex(r: number, g: number, b: number): string {
        return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
    }

    function interpolateColor(percent: number): string {
        const p = percent / 100
        let c1: [number, number, number], c2: [number, number, number], t: number
        if (p <= 0.5) {
            c1 = hexToRgb(GRADIENT_COLORS.low)
            c2 = hexToRgb(GRADIENT_COLORS.mid)
            t = p * 2
        } else {
            c1 = hexToRgb(GRADIENT_COLORS.mid)
            c2 = hexToRgb(GRADIENT_COLORS.high)
            t = (p - 0.5) * 2
        }
        return rgbToHex(
            c1[0] + (c2[0] - c1[0]) * t,
            c1[1] + (c2[1] - c1[1]) * t,
            c1[2] + (c2[2] - c1[2]) * t,
        )
    }

    const lineStyle = computed(() => {
        const percent = temperatureToPercent(currentWeather.value?.temp)
        return {
            '--temp-value': percent,
            '--ring-color': interpolateColor(percent),
        }
    })
</script>
<style lang="stylus" scoped>
    .temperature
        background-color white
        r(padding-top, 24px 16px)
        r(padding-bottom, 24px 16px)
        r(padding-left, 14px 14px)
        r(padding-right, 14px 14px)
        f(column, $justify: stretch, $align: flex-start)
        width 100%
        &__title__icon
            r(size, 40px 18px)
        &__title
            margin-left auto
            margin-right auto
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
            +layout(mobile)
                font-size 12px
                line-height 1.3
                font-weight $fw-bold
        &__content
            r(margin-top, 30px 7px)
            margin auto
            r(padding-top, 9px 4px)
            f(row, $justify: flex-start, $align: center)
            r(gap, 22px 10px)
            :deep(.UiSelector)
                r(width, 148px 70px)
                border 1px solid rgba($fjord, .5)
            +layout(mobile)
                margin-bottom 4px
            &__temperature
                f-style('h4')
                +layout(mobile)
                    font-size 30px
                    line-height 1.3
                    font-weight $fw-bold
            &__sensation
                r(margin-top, 9px 4px)
                text-align center
                r(font-size, 26px 12px)
                font-family $ff-text
                font-weight $fw-regular
                line-height 1.3
                color $fjord
            &__line
                margin-top auto
                position relative
                r(height, 10px 5px)
                width 100%
                border-radius 5px
                background-image linear-gradient(90deg, $fleuve 0%, $bouleau 50%, $crepuscule 100%)
                &::after
                    content ''
                    position absolute
                    top 50%
                    left unquote('calc(var(--temp-value) * 1%)')
                    transform translate(-50%, -50%)
                    r(size, 28px 14px)
                    background-color white
                    border-radius 50%
                    border 5px solid var(--ring-color, $bouleau)
                    box-sizing border-box
                +layout(mobile)
                    margin-top 15px
</style>