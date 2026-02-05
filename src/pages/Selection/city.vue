<template>
    <div class="selection-city">
        <div class="selection-city__container">
            <h1>{{ $t('selection.city_title') }}</h1>
            <div class="input-city-container">
                <input
                    type="text"
                    v-model="city"
                    :placeholder="$t('selection.city_placeholder')"
                    class="input-city"
                    :disabled="loading"
                    id="input-city"
                    name="input-city"
                    required
                    aria-required="true"
                    aria-label="Sélectionnez la ville"
                    aria-describedby="input-city-error"
                    aria-invalid="false"
                    aria-autocomplete="none"
                    aria-controls="input-city-error"
                />
                <ui-button
                    :label="$t('selection.city_validate')"
                    @click="submitCity"
                    :big="true"
                    theme="primary"
                    :disabled="loading"
                />
            </div>
            <p v-if="errorMessage" class="selection-city__error" role="alert">{{ errorMessage }}</p>
            <div class="background-image" v-html="IconLine"></div>
        </div> 
    </div>
</template>

<script setup lang="ts">
import IconLine from 'assets/svg/line_background.svg?raw'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from 'plugins/i18n/store'
import { store as appStore } from 'plugins/store/app'
import { apiService } from 'plugins/api'
import { setApiSite } from 'plugins/api/apiSite'

const city = ref('')
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()
const { t } = useI18n()
const i18nStore = useI18nStore()

async function submitCity() {
  const code = city.value?.trim() || ''
  if (!code) return
  loading.value = true
  errorMessage.value = ''
  try {
    await apiService.testSite(code, i18nStore.locale)
    setApiSite(code)
    await router.push('/')
    await appStore.initData()
  } catch {
    errorMessage.value = t('selection.city_error')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="stylus" scoped>
.selection-city
    width 100vw
    height 100vh
    background-color $ecume
    f(column, $justify: center, $align: center)
    overflow hidden
    .selection-city__container
        width 100%
        f(column, $justify: center, $align: center)
        position relative
        h1
            f-style('h1')
            margin-top auto
            color $fjord
        .input-city-container
            margin-top 30px
            f(row, $justify: center, $align: center)
            r(width, 400px 600px)
            r(height, 155px 73px)
            r(gap, 20px)
            padding 0 20px
            font-size 24px
            z-index 10
            :deep(.UiButton)
                background $fjord
                color $aube
        .input-city
            r(margin-top, 40px)
            r(margin-bottom, 40px)
            r(width, 400px 400px)
            height 100%
            border-radius $radius-lg
            border 1px solid $aube
            padding 0 20px
            font-size 24px
        :deep(.UiButton)
            background $aube
            color $fjord
        .selection-city__error
            margin-top 16px
            color #c00
            f-style('default')
            text-align center
            max-width 600px
        .background-image
            position absolute
            top 35%
            left 0
            color rgba($fjord, 0.3)
            +layout(mobile)
                top 60px
                left -30%
                width 100%
                height 100%
                transform scale(.5)
</style>