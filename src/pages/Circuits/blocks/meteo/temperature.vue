<template>
    <div class="temperature">
        <div class="temperature__title">
            {{ $t('meteo.temperature') }}
        </div>
        <div class="temperature__content">
            <div class="temperature__content__temperature">
                19°
            </div>
            <UiSelector
                v-model="currentTemp"
                :options="[
                { value: 'celsius', label: 'C' },
                { value: 'farhrenheit', label: 'F' }
                ]"
                @change="(value: string) =>onViewChange(value)"
            />
        </div>
        <div class="temperature__content__sensation">
            <div class="temperature__content__sensation__title">
                10° {{ (currentTemp === 'celsius' ? 'C' : 'F' )}} {{ $t('meteo.sensation') }} <br>
                {{ $t('meteo.ressenti') }}
            </div>
            <div class="temperature__content__sensation__text">
                {{ $t('meteo.sensation') }}
            </div>
        </div>
        <div class="temperature__content__line" :data-temp="currentTemp"></div>
    </div>
</template>
<script setup lang="ts">
    import { ref } from 'vue'
    const currentTemp = ref('celsius')
    const onViewChange = (value: string) => {
        console.log(value)
        currentTemp.value = value
    }
</script>