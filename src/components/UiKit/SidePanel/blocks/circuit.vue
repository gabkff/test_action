<template>
    <div class="SidePanel__circuit">
        <!-- Contenu événement -->
        <div class="SidePanel__circuit__header"> {{$t('circuits.name') + '-' + data.title }} </div>
        <div class="SidePanel__circuit__step"> 
            <ui-button theme="icon" :icon="IconBoot" v-if="data.step.activity_type === 'Promenade'"/>
            <div>{{ $t('circuits.step', { number: data.index }) }} </div>
        </div>
        <div class="SidePanel__circuit__title"> {{ data.step.title }}</div>
        <div class="SidePanel__circuit__image-wrapper">
        <ui-swiper :options="{ slidesPerView: 1, spaceBetween: 30, centeredSlides: false }" :overflow="true" :navigation="true">
            <ui-picture v-for="image in data.step.images as Image[]" :key="image.meta" :images="image.images" class="SidePanel__circuit__image"/>
        </ui-swiper>
        </div>
        <div class="SidePanel__circuit__content-info">
            <div class="SidePanel__circuit__content-info-item" v-if="data.step.estimated_time">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.activity_time') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> {{ data.step.estimated_time }}</div>
            </div>
            <div class="SidePanel__circuit__content-info-item" v-if="data.step.seasons">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.best_season') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> 
                    <template v-for="(season, seasondex) in data.step.seasons" :key="season">
                        <span>{{ season }}</span>
                        <template v-if="seasondex as number < (data.step.seasons.length - 1)">,&nbsp;</template>
                    </template>
                </div>
            </div>
            <div class="SidePanel__circuit__content-info-item" v-if="data.step.essentials">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.need') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> 
                {{ data.step.essentials }}
                </div>
            </div>
            <div class="SidePanel__circuit__content-info-item" v-if="data.step.activity_type">
                <div class="SidePanel__circuit__content-info-item-label">{{ $t('circuits.type') }}</div>
                <div class="SidePanel__circuit__content-info-item-value"> {{ data.step.activity_type }}</div>
            </div>
        </div>

        <div class="SidePanel__circuit__qrcode">
            <div class="SidePanel__circuit__qrcode-label">{{ $t('circuits.qrcode') }}</div>
            <div class="SidePanel__circuit__qrcode-value"> QRCODE</div>
        </div>
        <!-- Flèches -->
        <div class="SidePanel__circuit__scroll">
            <div class="SidePanel__circuit__scroll-title"> {{ data.step.description}}</div>
            <div class="SidePanel__circuit__scroll-arrows">
                <UiButton theme="arrow" :direction="'up'" @click="scrollUpDesc()"/>
                <UiButton theme="arrow" :direction="'down'" @click="scrollDownDesc()"/>
            </div>
        </div>
        <div class="SidePanel__description" ref="descriptionEventRef">
            <UiWysiwyg v-html="data.description"/>
        </div>
        <div class="SidePanel__circuit__map">
            <UiMap/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import UiButton from 'components/UiKit/Button/index.vue'
import IconBoot from 'assets/svg/boot.svg?raw'
import UiMap from 'components/ui/Maps/index.vue'
import UiWysiwyg from 'components/UiKit/Wysiwyg/index.vue'
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
const descriptionEvent = useTemplateRef<HTMLElement | null>('descriptionEventRef')
function scrollUpDesc() {
  if (!descriptionEvent.value) return
  descriptionEvent.value.scrollTop -= 100
}
function scrollDownDesc() {
  if (!descriptionEvent.value) return
  descriptionEvent.value.scrollTop += 100
}
</script>

<style lang="stylus" scoped>
.SidePanel__circuit
    color $fjord
    &__header
        f-style('body')
    &__step
        f(row, $justify: flex-start)
        gap 40px
        margin-top 120px
        f-style('subtitle')
        .UiButton--icon
            width 94px
            height 94px
    &__title
        f-style('h3')
        margin 0
        margin-top 125px
        margin-bottom 120px
    &__image-wrapper
        width 100%
        height 100%
        :deep(.swiper-wrapper)
            gap 30px
        .SidePanel__circuit__image
            height 650px
            width 1155px !important
            background-color $fjord
            object-fit cover
    &__content-info
        f(row, $justify: flex-start)
        margin-top 120px
        width 100%
        flex-wrap wrap
        .SidePanel__circuit__content-info-item
            f(column, $justify: flex-start)
            width 50%
            margin-bottom 60px
            .SidePanel__circuit__content-info-item-label
                f-style('subtitle')
                opacity .5
            .SidePanel__circuit__content-info-item-label:first-letter
                text-transform uppercase
            .SidePanel__circuit__content-info-item-value
                f-style('bold-infos')
                margin-top 8px
            .SidePanel__circuit__content-info-item-value:first-letter
                text-transform uppercase
    &__qrcode
        border-top 2px solid $fjord
        border-bottom 2px solid $fjord
        padding-top 60px
        padding-bottom 60px
        margin-bottom 80px
        f(row, $justify: space-between)
        .SidePanel__circuit__qrcode-label
            f-style('h5')
            width 637px
        .SidePanel__circuit__qrcode-value
            background-color $fjord
            width 175px
    &__scroll
        f(row, $justify: space-between)
        margin-bottom 80px
        .SidePanel__circuit__scroll-title
            f-style('h5')
        .SidePanel__circuit__scroll-title:first-letter
            text-transform uppercase
    &__map
        height 600px
</style>