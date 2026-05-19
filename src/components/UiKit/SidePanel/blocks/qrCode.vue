<template>
    <div class="SidePanel__qrCode">
        <div class="SidePanel__qrCode-logo" v-html="Logo"></div>
        <div class="SidePanel__qrCode-text">
            <div class="SidePanel__qrCode-title-index">{{ $t('circuits.index', { index: data.index + 1}) }}</div>
            <h2 class="SidePanel__qrCode-title"> {{ data.title }} </h2>
            <img :src="data.qr" alt="QR Code" class="SidePanel__qrCode-img"/>
            <div class="SidePanel__qrCode-title-description">{{ $t('circuits.qrcode_panel') }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Logo from 'assets/svg/logo.svg?raw'
defineProps<{
    data: Record<string, any>
}>()
</script>

<style lang="stylus" scoped>
    .SidePanel__qrCode
        color $fjord
        f(column, $justify: flex-start, $align: center)
        margin-left auto
        margin-right auto
        height 100%
        &-text
            height 100%
            f(column, $justify: center, $align: center)
            padding-left 61px
            padding-right 61px
        &-title-index
            f-style('subtitle')
            r(margin-bottom, 15px 8px)
            opacity 0.6
            &::first-letter
                text-transform uppercase
            +layout(mobile)
                font-size 14px
                opacity 1
        &-title
            f-style('h2')
            text-align center
            r(margin-bottom, 80px 40px)
            align-text center
            +layout(mobile)
                font-size 35px
        &-logo
            position absolute
            +layout(mobile)
                width 105px
                :deep(svg)
                    width 100%
                    height 100%
        &-img
            r(size, 265px 132px)
            margin-bottom 80px
        &-title-description
            f-style('h4')
            text-align center
            width 80%
            +layout(mobile)
                font-size 20px
                line-height 1.3
                width 60%
                font-weight $fw-medium

</style>