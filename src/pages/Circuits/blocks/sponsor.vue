<template>
    <div class="sponsor">
        <div class="sponsor__image">
            <ui-picture :images="currentSponsor?.image" :cover="'cover'" />
        </div>
        <div class="sponsor__content">
            <div class="sponsor__content__header">
                <div class="sponsor__content__header__title">
                    {{ $t('menu.sponsorised') }}
                </div>
                <div class="sponsor__content__header__logo">
                    <ui-picture :images="currentSponsor?.logo" />
                </div>
            </div>
            <div class="sponsor__content__body">
                <div class="sponsor__content__body__title">
                    {{ currentSponsor?.title }}
                </div>
                <div class="sponsor__content__body__city">
                    {{ currentSponsor?.city }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { store as appStore } from 'plugins/store/app'
import { computed } from 'vue'
import UiPicture from 'components/UiKit/Picture/index.vue'
const currentSponsor = computed(() => {
    // Trouvé une logique de random pour afficher les sponsors
    if (appStore.home?.featured_partners?.length && appStore.home?.featured_partners?.length > 0 ) return appStore.home?.featured_partners[1]
    return null
})

defineProps<{
    left: boolean
}>()
</script>

<style lang="stylus" scoped>
    .sponsor
        r(margin-top, 73px)
        r(min-height, 302px)
        border-radius $radius-lg
        background-color white
        r(padding, 20px)
        f(row, $justify: flex-start, $align: flex-start)
        r(gap, 30px)
        height 100%
        &__content
            width 100%
            height 100%
        &__image
            flex-shrink 0
            height 100%
            r(width, 276px)
        &__content__header
            f(row, $justify: space-between, $align: flex-start)
        &__content__header__title
            opacity 0.5
            f-style('h6')
            color $fjord
        &__content__header__logo
            r(size, 90px)
            background red
        &__content__body
            margin-top auto
            align-self flex-end
            f(column, $justify: flex-start, $align: flex-start)
            r(gap, 10px)
            &__title
                f-style('h5')
                color $fjord
            &__city
                f-style('default')
                color $fjord
</style>