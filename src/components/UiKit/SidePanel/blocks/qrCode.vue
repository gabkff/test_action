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
        &-text
            height 100%
            f(column, $justify: center, $align: center)
            padding-left 61px
            padding-right 61px
        &-title-index
            f-style('small-text')
            margin-bottom 15px
        &-title
            f-style('h2')
            margin-bottom 80px
        &-img
            size 265px
            margin-bottom 80px
        &-title-description
            f-style('h4')
            text-align center
            width 80%

</style>