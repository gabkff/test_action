<template>
  <div class="selection">
    <h1 class="selection__title"> {{ $t('common.discover_circuits') }} </h1>
    <UiSelector
        v-model="selectedLang"
        :options="[
        { value: 'fr', label: 'FR' },
        { value: 'en', label: 'EN' }
        ]"
        @change="onLangChange"
    />
    <div class="selection__circuits">
        <div class="selection__circuits__background" v-html="IconLine"></div>
        <div class="selection__circuits__item"
            v-for="(circuit, circuitIndex) in appStore.circuits"
            :key="circuitIndex"
            :data-circuit-theme="circuitIndex"
        >
        <ui-picture v-if="circuit.image" :images="circuit.image.images" :cover="'cover'" :data-circuit-theme="circuitIndex"/>
        <div class="selection__circuits__item__content">
            <div class="selection__circuits__item__content__title" :data-circuit-theme="circuitIndex"> {{ circuit.title }}</div>
            <div class="selection__circuits__item__content__description" :data-ircuit-theme="circuitIndex"> {{ circuit.description }}</div>
            <div class="selection__circuits__item__content__text_action" :data-circuit-theme="circuitIndex">
                            <ui-tag :label="$t('circuits.total_step', { number: circuit.steps.length })" />
                            <ui-button 
                                theme="primary" 
                                :label="$t('common.link_discover')" 
                                :icon="IconPlus" 
                                :iconPosition="'right'"
                                @click="router.push(`/circuits/${circuit.slug}`)"
                            />
                        </div>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
    import UiTag from 'components/UiKit/Tag/index.vue'
    import UiSelector from 'components/ui/Selector.vue'
    import { useI18nStore } from 'plugins/i18n/store'
    import { store as appStore } from 'plugins/store/app'
    import { ref, onMounted } from 'vue'
    import IconLine from 'assets/svg/line_background.svg?raw'
    import IconPlus from 'assets/svg/plus.svg?raw'
    import { useRouter } from 'vue-router'
    const selectedLang = ref('fr')
    const i18nStore = useI18nStore()
    const router = useRouter()
    onMounted(() => {
        selectedLang.value = i18nStore.locale
    })
    function onLangChange(value: string | number) {
        i18nStore.setLocale(selectedLang.value as LocaleKey)
    }
</script>

<style lang="stylus" scoped>
    .selection
        width 100vw
        height 100vh
        background $embruns
        .selection__title
            r(margin-top, 100px)
            r(margin-left, 100px)
            r(width, 1150px)
            f-style('h1')
            color $fjord
            r(margin-bottom, 60px)
        :deep(.UiSelector)
            r(margin-left, 100px)
            r(margin-bottom, 66px)
        &__circuits__background
            position absolute
            left 0
            top 35%
            bottom 25%
            width 100%
            height 100%
            z-index 0
            color $fjord
        &__circuits__item
            z-index 1
            position absolute
            padding 10px
            border-radius $radius-lgxl
            background-color $fjord
            color $aube
            f(column, $align: flex-start, $justify: flex-start)
            gap 24px
            r(width, 789px)
            r(left, 188px)
            r(top, 1376px)
            &[data-circuit-theme="1"]
                background-color $penombre
                color $crepuscule
                r(left, 1177px)
                r(top, 847px)
            &[data-circuit-theme="2"]
                r(left, 1077px)
                r(top, 2230px)
                background-color $epinette
                color $bouleau
            :deep(.UiPicture)
                height 800px
                &[data-circuit-theme="2"]
                    order 2
            &__content
                f(column, $align: flex-start, $justify: flex-start)
                r(gap, 30px)
                &__title
                    f-style('h2')
                    padding-left 20px
                    padding-right 20px
                &__description
                    text-align right
                    width 70%
                    margin-left auto
                    f-style('small-text')
                    padding-right 20px
                &__text_action
                    margin-left auto
                    f(row, $align: center, $justify: flex-end)
                    r(width, 100%)
                    r(gap, 15px)
                    margin-bottom 20px
                    padding-right 20px

</style>