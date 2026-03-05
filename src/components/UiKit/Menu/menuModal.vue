 <!-- src/components/UiKit/Menu/MenuModal.vue -->
<template>
    <Teleport to="body">
      <Transition name="menu-overlay">
        <div v-if="menuStore.isOpen" class="MenuModal">
          <div class="MenuModal__overlay" @pointerdown="menuStore.close()" />
          <div class="MenuModal__content" @pointerdown.stop>
            <div class="MenuModal__content__background" v-html="isDesktop ? IconLine : IconLineMobile"></div>
            <!-- Bouton retour contextuel -->
             <div class="MenuModal__header">
                <div class="MenuModal__header__title">{{ $t('common.discover_circuits') }}</div>
                <UiSelector
                    v-model="selectedLang"
                    :options="[
                    { value: 'fr', label: 'FR' },
                    { value: 'en', label: 'EN' }
                    ]"
                    @change="onLangChange"
                />
             </div>
            <!-- Le contenu du menu réutilisé -->
             <div class="MenuModal__content__container">
                <div class="MenuModal__content__container__top_part">
                    <div class="MenuModal__content__container__top_part__left_part" style="height: 100%;">
                        <div v-if="menuStore.origin === 'circuit'" class="MenuModal__content__container__left_part__circuit" :data-circuit-theme="circuitIndex">
                            <div class="MenuModal__content__container__left_part__circuit__surtitle">
                                {{ $t('circuits.name') }} {{ circuitIndex! + 1 }}
                            </div>
                            <div class="MenuModal__content__container__left_part__circuit__title">
                                {{ appStore.circuits.find(circuit => circuit.id === menuStore.payload.circuitId as number)?.title }}
                            </div>
                            <ui-button theme="secondary" :icon="IconArrow" class="MenuModal__content__container__left_part__circuit__home_button"
                                :label="$t('common.backToCircuit')"
                                @pointerdown="menuStore.close()"
                            />
                        </div>
                        <div v-else class="MenuModal__content__container__bottom_part__right_part__event first-event" style="height: 100%;">
                            <div class="MenuModal__content__container__bottom_part__right_part__event__title">
                                {{ nextEventDate ?? '' }}
                            </div>
                            <div class="MenuModal__content__container__bottom_part__right_part__event__content" style="height: 90%;" @pointerdown="menuStore.close();router.push(`/evenements`)">
                                <ui-picture :images="nextEvent.main_image.images" :cover="'cover'" v-if="nextEvent"/>
                                <div class="MenuModal__content__container__bottom_part__right_part__event__content__overlay">
                                    <div class="MenuModal__content__container__bottom_part__right_part__event__content__heure">
                                        <template v-if="nextEvent?.time_start && nextEvent?.time_end && nextEvent.time_start !== nextEvent.time_end && nextEvent.time_start !== '00:00' && nextEvent.time_end !== '00:00'">
                                            <span class="EventItem__time-text">
                                                {{ $t('events.time_start_end', { start: nextEvent.time_start, end: nextEvent.time_end }) }}
                                            </span>
                                        </template>
                                        <template v-else>
                                            <span>{{ nextEvent?.time_start|| nextEvent?.time_end }} </span>
                                        </template>
                                    </div>
                                    <div class="MenuModal__content__container__bottom_part__right_part__event__content__title">
                                        {{ nextEvent?.title ?? $t('events.no_event') }}
                                    </div>
                                    <div class="MenuModal__content__container__bottom_part__right_part__event__content__button">
                                        <ui-button :label="$t('events.see_all')" :icon="IconPlus" iconPosition="right" @pointerdown="menuStore.close();router.push(`/evenements`)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    <div class="MenuModal__content__container__top_part__right_part">
                        <div class="MenuModal__content__container__right_part__circuits">
                            <div class="MenuModal__content__container__right_part__circuits__title"> {{ $t('menu.discover') }}</div>
                            <div class="MenuModal__content__container__right_part__circuits__wrapper">
                                <div class="MenuModal__content__container__right_part__circuit"
                                    v-for="(circuit, circuitIndex) in appStore.circuits.filter(circuit => circuit.id !== Number(route.params.id))"
                                    :key="circuit.id"
                                    :data-circuit-theme="circuitIndex"
                                    v-tap="() => {menuStore.close();router.push(`/circuits/${circuit.id}`)}"
                                >
                                    <ui-picture v-if="circuit.image" :images="circuit.image.images" :cover="'cover'" />
                                    <div class="MenuModal__content__container__right_part__circuit__content">
                                    <div class="MenuModal__content__container__right_part__circuit__content__title" :data-circuit-theme="circuitIndex"> {{ circuit.title }}</div>
                                    <div class="MenuModal__content__container__right_part__circuit__content_text_action" :data-circuit-theme="circuitIndex">
                                        <ui-tag :label="$t('circuits.total_step', { number: circuit.steps.length })" />
                                        <ui-button theme="primary" :label="$t('common.link_discover')" :icon="IconPlus" :iconPosition="'right'"
                                            v-tap="() => {menuStore.close();router.push(`/circuits/${circuit.id}`)}"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                <div class="MenuModal__content__container__middle_part">
                    <div class="MenuModal__content__container__middle_part__left_part">
                        <div class="MenuModal__content__container__left_part__dyk">
                            <div class="MenuModal__content__container__left_part__dyk__icon" v-html="IconMind"></div>
                            <div class="MenuModal__content__container__left_part__dyk__content">
                                <div class="MenuModal__content__container__left_part__dyk__content__title">{{ $t('did_you_know.title') }}</div>
                                <span class="MenuModal__content__container__left_part__dyk__content__text">
                                    {{ appStore.home?.inspirational_text }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="MenuModal__content__container__middle_part__right_part">
                        <div class="MenuModal__content__container__right_part__follow">
                            <div class="MenuModal__content__container__right_part__follow__title"> {{ $t('menu.follow', { account: appStore.home?.instagram_account }) }}</div>
                            <div class="MenuModal__content__container__right_part__follow__icon" v-html="IconInstagram"></div>
                        </div>
                    </div>
                </div>
                <div class="MenuModal__content__container__bottom_part" v-if="menuStore.origin === 'circuit'">
                    <div class="MenuModal__content__container__bottom_part__left_part">
                        <div class="MenuModal__content__container__part_meteo">
                            <div class="MenuModal__content__container__part_meteo__header">
                                <div class="MenuModal__content__container__part_meteo__title"> {{ $t('meteo.condition_meteo') }}</div>
                                <div class="MenuModal__content__container__part_meteo__action__wrapper">
                                    <ui-button theme="arrow" :direction="'left'" @pointerdown="swipeSlide('meteo', 'prev')"/>
                                    <ui-button theme="arrow" :direction="'right'" @pointerdown="swipeSlide('meteo', 'next')"/>
                                </div>
                            </div>
                            
                            <ui-swiper :options="{ slidesPerView: 2, spaceBetween: 20, centeredSlides: false }" :overflow="true" :navigation="false" ref="meteoSwiper">
                                <condition /> 
                                <vent />
                                <temperature /> 
                                <maree/>
                            </ui-swiper>
                        </div>
                        <sponsor v-if="currentSponsor" :left="true" :currentSponsor="currentSponsor[0] ?? null"/>
                    </div>
                    <div class="MenuModal__content__container__bottom_part__right_part">
                        <div class="MenuModal__content__container__bottom_part__right_part__event">
                            <div class="MenuModal__content__container__bottom_part__right_part__event__title">
                                {{ nextEventDate ?? '' }}
                            </div>
                            <div class="MenuModal__content__container__bottom_part__right_part__event__content" @pointerdown="menuStore.close();router.push(`/evenements`)">
                                <ui-picture :images="nextEvent.main_image.images" :cover="'cover'" v-if="nextEvent"/>
                                <div class="MenuModal__content__container__bottom_part__right_part__event__content__overlay">
                                    <div class="MenuModal__content__container__bottom_part__right_part__event__content__heure">
                                        <template v-if="nextEvent?.time_start && nextEvent?.time_end && nextEvent.time_start !== nextEvent.time_end && nextEvent.time_start !== '00:00' && nextEvent.time_end !== '00:00'">
                                            <span class="EventItem__time-text">
                                                {{ $t('events.time_start_end', { start: nextEvent.time_start, end: nextEvent.time_end }) }}
                                            </span>
                                        </template>
                                        <template v-else>
                                            <span>{{ nextEvent?.time_start|| nextEvent?.time_end }} </span>
                                        </template>
                                    </div>
                                    <div class="MenuModal__content__container__bottom_part__right_part__event__content__title">
                                        {{ nextEvent?.title ?? $t('events.no_event') }}
                                    </div>
                                    <div class="MenuModal__content__container__bottom_part__right_part__event__content__button">
                                        <ui-button :label="$t('events.see_all')" :icon="IconPlus" iconPosition="right" @pointerdown="menuStore.close();router.push(`/evenements`)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="MenuModal__content__container__bottom_part alternate-part" v-else>
                    <div class="menu-page__part_meteo__title"> {{ $t('meteo.condition_meteo') }}</div>
                    <div class="MenuModal__content__container__bottom_part__meteo">
                        <condition /> 
                        <vent />
                        <temperature /> 
                        <maree/>
                    </div>
                    <div class="menu-page__part_sponsor" v-if="currentSponsor">
                        <sponsor :left="false" :currentSponsor="currentSponsor[0] ?? null"/>
                        <sponsor :left="false" :currentSponsor="currentSponsor[1] ?? null"/>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </Transition>
    </Teleport>
</template>
<script setup lang="ts">
    import { ref, onMounted, computed, watch } from 'vue'
    import { useMenuStore } from 'store/menu'
    import { store as appStore } from 'plugins/store/app'
    import { useI18nStore } from 'plugins/i18n/store'
    import { useRoute, useRouter } from 'vue-router'
    import { useNextEvent } from 'plugins/utils'
    import { store as interfaceStore } from 'plugins/store/interface'
    import IconLine from 'assets/svg/line_background.svg?raw'
    import IconLineMobile from 'assets/svg/line_background_mobile.svg?raw'
    import IconPlus from 'assets/svg/plus.svg?raw'
    import IconMind from 'assets/svg/mind.svg?raw'
    import IconInstagram from 'assets/svg/instagram.svg?raw'
    import IconArrow from 'assets/svg/arrow.svg?raw'
    import UiSelector from 'components/ui/Selector.vue'
    import UiTag from 'components/UiKit/Tag/index.vue'
    import Condition from './meteo/condition.vue'
    import Sponsor from './sponsor.vue'
    import Vent from './meteo/vent.vue'
    import Temperature from './meteo/temperature.vue'
    import Maree from './meteo/maree.vue'

    const menuStore = useMenuStore()
    const i18nStore = useI18nStore()
    const selectedLang = ref('fr')
    const route = useRoute()
    const router = useRouter()
    const meteoSwiper = ref<any>(null)
    const nextEventData = useNextEvent()
    const nextEvent = computed(() => nextEventData.value?.event ?? null)
    const nextEventDate = computed(() => nextEventData.value?.label ?? '')
    const isDesktop = computed(() => interfaceStore.isDesktop)

    onMounted(() => {
        selectedLang.value = i18nStore.locale

    })

    const currentSponsor = computed(() => {
        if (appStore.home?.featured_partners?.length && appStore.home?.featured_partners?.length > 1 ) {
            const sponsors = []
            const getIndex = (max: number) => {
                return Math.floor(Math.random() * max)
            }
            let first = getIndex(appStore.home?.featured_partners?.length ?? 0)
            let second = -1;
            //do {
                second = getIndex(appStore.home?.featured_partners?.length ?? 0)
                console.log(second, first)
            //} while (second === first)
            sponsors.push(appStore.home?.featured_partners[first])
            sponsors.push(appStore.home?.featured_partners[second])
            return sponsors as Sponsor[]
        } else {
            return []
        }
    })
    function onLangChange(value: string | number) {
        i18nStore.setLocale(selectedLang.value as LocaleKey)
    }

    const circuitIndex = computed(() => {
        return appStore.circuits.findIndex(circuit => circuit.id === menuStore.payload.circuitId as number)
    })

    const swipeSlide = (swiper: string, direction: 'prev' | 'next') => {
        if (swiper === 'meteo') {
            if (direction === 'prev') {
                meteoSwiper.value.swiper.slidePrev()
            } else {
                meteoSwiper.value.swiper.slideNext()
            }
        }
    }
</script>

<style lang="stylus" scoped>
.MenuModal
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    z-index 1000
    &__overlay
        position absolute
        top 0
        left 0
        right 0
        bottom 0
        z-index -1
        background rgba($fjord, 0.5)
        backdrop-filter blur(4px)
    &__content
        position relative
        width 100vw
        height 100%
        background $embruns
        display flex
        flex-direction column
        z-index 100
        box-shadow -10px 0 40px rgba(0, 0, 0, 0.15)
        &__background
            position absolute
            top 35%
            left 0
            bottom 25%
            z-index -1
            color $fjord
        &__container
            r(padding-left, 100px 50px)
            r(padding-right, 100px 50px)
            r(padding-bottom, 100px 50px)
            f(column, $justify: flex-start, $align: flex-start)
            r(gap, 60px 0px)
            &__top_part,
            &__middle_part,
            &__bottom_part
                f(row, $justify: flex-start, $align: flex-start)
                r(gap, 139px 50px)
            &__top_part
                &__left_part
                    r(width, 833px 391px)
            &__middle_part
                &__right_part
                    display flex
                    height 100%
                    align-self flex-end
            &__bottom_part
                r(margin-top, 126px 20px)
                width 100%
                &__left_part
                    r(width, 833px 391px)
                    overflow hidden
                &__right_part
                    flex 1
                    height 100%
                &__right_part__event
                    width 100%
                    &__title
                        f-style('h5')
                        color $fjord
                        r(margin-bottom, 80px 20px)
                        +layout(mobile)
                            font-size 23px
                            line-height 1.1
                            font-weight $fw-bold
                    &__content
                        r(min-height, 789px 224px)
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
                            width 100%
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
                overflow hidden
                :deep(.UiSwiper)
                    height 100%
                :deep(.swiper-slide)
                    r(height, 412px 200px)
            &__part_meteo__header
                f(row, $justify: space-between, $align: center)
                r(margin-bottom, 36px 20px)
            &__part_meteo__action__wrapper
                f(row, $justify: space-between, $align: center)
                r(gap, 10px)
                :deep(.UiButton)
                    r(size, 80px 40px)
                    background white
                :deep(.UiButton__arrow)
                    r(width, 32x 20px)
                    r(height, 32px 20px)
                    +layout(mobile)
                        width 100%
            &__part_meteo__title
                f-style('h5')
                color $fjord
                r(margin-bottom, 45px 20px)
                +layout(mobile)
                    font-size 23px
                    line-height 1.1
                    font-weight $fw-bold
            
            &__left_part
                &__circuit
                    background $fjord
                    r(padding, 60px 20px)
                    f(column, $justify: flex-start, $align: flex-start)
                    r(min-height, 1005px 503px)
                    border-radius $radius-lgxl
                    r(width, 826px 393px)
                    color $aube
                    r(margin-top, 117px 45px)
                    +layout(mobile)
                        height 403px
                        min-height unset
                    &[data-circuit-theme="1"]
                        background-color $penombre
                        color $crepuscule
                    &[data-circuit-theme="2"]
                        background-color $epinette
                        color $bouleau
                    &__surtitle
                        f-style('h5')
                        &:first-letter
                            text-transform uppercase
                        +layout(mobile)
                            font-size 23px
                            line-height 1.1
                            font-weight $fw-bold
                    &__title
                        f-style('h2')
                        +layout(mobile)
                            font-size 45px
                            line-height 1.1
                            font-weight $fw-bold
                    &__home_button
                        margin-top auto
                        background-color transparent
                        border 1px solid rgba(#F6F2F0, 0.3)
                        :deep(.UiButton__icon)
                            transform rotate(180deg)
                &__dyk
                    r(width, 828px)
                    r(padding-left, 60px 28px)
                    r(padding-right, 60px 28px)
                    r(padding-top, 45px 21px)
                    r(padding-bottom, 45px 21px)
                    background-color white
                    r(border-radius, $radius-lg 6px)
                    f(row, $justify: flex-start, $align: center)
                    r(gap, 60px 28px)
                    r(margin-top, 117px 10px)
                    +layout(mobile)
                        width 100%
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
            &__right_part
                &__circuits
                    width 100%
                    min-height 1126px
                    f(column, $justify: stretch, $align: flex-start)
                    +layout(mobile)
                        min-width 388px
                        r-mobile(min-height, 453px)
                    &__title
                        f-style('h5')
                        color $fjord
                        r(margin-bottom, 60px 20px)
                        &:first-letter
                            text-transform uppercase
                        +layout(mobile)
                            font-size 23px
                            line-height 1.1
                            font-weight $fw-bold
                &__circuit
                    r(width, 805px 388px)
                    f(row, $justify: stretch, $align: flex-start)
                    r(gap, 25px 10px)
                    r(min-height, 470px 223px)
                    border-radius $radius-lgxl
                    r(padding, 10px 5px)
                    background-color $fjord
                    r(max-height, 600px 400px)
                    +layout(mobile)
                        border-radius 6px
                        width 500px
                    :deep(.UiPicture)
                        flex 1
                    &[data-circuit-theme="1"]
                        background-color $penombre
                    &[data-circuit-theme="2"]
                        background-color $epinette
                    &__content
                        flex 1
                        f(column, $justify: space-between, $align: flex-start)
                        r(margin-right, 20px 20px)
                        +layout(mobile)
                            width 183px
                        &__title
                            font-family $ff-title
                            text-transform uppercase
                            font-size 96px
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
                        &_text_action
                            f(row, $justify: stretch)
                            r(gap, 14px)
                            width 100%
                            margin-top auto
                            r(margin-top, 20px)
                            r(padding-right, 10px)
                            align-self flex-start
                            :deep(.UiTag)
                                border 1px solid rgba(#f8f3ff, 0.5)
                                r(min-width, 141px 80px)
                                .UiTag__label
                                    margin auto
                            &[data-circuit-theme="1"]
                                :deep(.UiButton)
                                    background-color $ecume
                                    color $epinette
                            &[data-circuit-theme="2"]
                                :deep(.UiButton)
                                    background-color $aurore
                                    color $penombre
                &__follow
                    align-self flex-end
                    background white
                    r(padding, 45px 20px)
                    border-radius $radius-lg
                    f(row, $justify: space-between, $align: flex-start)
                    r(gap, 30px 15px)
                    r(width, 805px 388px)
                    +layout(mobile)
                        border-radius 6px
                    &__title
                        f-style('default')
                        +layout(mobile)
                            font-size 17px
                            line-height 1.4
                            font-weight $fw-medium
                    &__icon
                        r(size, 65px 30px)
    &__header
        r(padding, 100px 50px)
        f(column, $justify: flex-start, $align: flex-start)
        r(gap, 60px 40px)
        +layout(mobile)
            padding-bottom 20px
        &__title
            f-style('h1')
            width 60%
            +layout(mobile)
                f-style('h3')
    .first-event
        .MenuModal__content__container__bottom_part__right_part__event__title
            r(margin-bottom, 60px 20px)
    .MenuModal__content__container__right_part__circuits__wrapper
        r(gap, 30px 15px)
        f(column, $justify: stretch, $align: stretch)
        height 100%
        flex 1
        +layout(mobile)
            flex-direction row
            width 100%
            height 412px
            max-height unset
            min-height unset
            overflow scroll
            width 600px
            padding-right 200px
        .MenuModal__content__container__right_part__circuit
            flex 1
            align-items stretch
            justify-content stretch
            +layout(mobile)
                min-width 500px
                padding 20px
    .alternate-part
        margin-top 10px
        f(column, $justify: flex-start, $align: flex-start)
        width 100%
        gap 0
        r(padding-right, 190px 0px)
        .menu-page__part_meteo__title
            f-style('h5')
            color $fjord
            r(margin-bottom, 45px 20px)
            +layout(mobile)
                font-size 23px
                line-height 1.1
                font-weight $fw-bold
        .MenuModal__content__container__bottom_part__meteo
            f(row, $justify: flex-start, $align: stretch)
            r(gap, 36px)
            width 100%
            > *
                flex 1 1 0
                min-width 0
                height 412px
                +layout(mobile)
                    height 220px
    .menu-page__part_sponsor
        f(row, $justify: space-between, $align: stretch)
        r(gap, 30px 15px)
        width 100%
        > *
            flex 1 1 0
            min-width 0
            height 100%
            +layout(mobile)
                margin-top 10px
                min-height 100px
// --- Transition d'entrée ---
.menu-overlay-enter-active
    transition opacity 0.25s ease
    .MenuModal__content
        transition transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease

// --- Transition de sortie ---
.menu-overlay-leave-active
    transition opacity 0.25s ease-in
    .MenuModal__content
        transition transform 0.25s ease-in, opacity 0.25s ease-in

// --- États initial (entrée) et final (sortie) ---
.menu-overlay-enter-from,
.menu-overlay-leave-to
    opacity 0
    .MenuModal__content
        opacity 0
        transform translateY(40px)
</style>