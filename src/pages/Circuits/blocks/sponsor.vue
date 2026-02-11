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
                <div class="sponsor__content__header__logo" v-if="currentSponsor?.logo">
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
    if (appStore.home?.featured_partners?.length && appStore.home?.featured_partners?.length > 0 ) {
        const index = Math.floor(Math.random() * ( (appStore.home.featured_partners.length -1) - 0 +1))
        return appStore.home?.featured_partners[index]
    }
    return null
})

defineProps<{
    left: boolean
}>()
</script>

<style lang="stylus" scoped>
    .sponsor
        width 100%
        r(margin-top, 73px 45px)
        r(min-height, 302px)
        r(border-radius, $radius-lg 4px)
        background-color white
        r(padding, 20px 4px)
        f(row, $justify: flex-start, $align: stretch)
        r(gap, 30px 15px)
        +layout(mobile)
            min-height 196px
        &__content
            width 100%
            height 100%
            display flex
            flex-direction column
            align-items stretch
        &__image
            flex-shrink 0
            r(width, 276px 130px)
            :deep(.UiPicture)
                height 100%
        &__content__header
            f(row, $justify: space-between, $align: flex-start)
        &__content__header__title
            opacity 0.5
            f-style('h6')
            color $fjord
            &::first-letter
                text-transform uppercase
            +layout(mobile)
                font-size 10px
                line-height 1.3
                font-weight $fw-regular
        &__content__header__logo
            r(size, 90px 42px)
            display flex
            :deep(.UiPicture)
                border-radius 0
                width 100%
                height 100%
        &__content__body
            margin-top auto
            align-self flex-start
            f(column, $justify: flex-start, $align: flex-start)
            r(gap, 10px)
            &__title
                f-style('h5')
                color $fjord
                +layout(mobile)
                    font-size 23px
                    line-height 1.1
                    font-weight $fw-bold
            &__city
                f-style('default')
                color $fjord
                +layout(mobile)
                    font-size 17px
                    line-height 1.4
                    font-weight $fw-medium
</style>