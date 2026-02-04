<template>
  <div class="events-page">
    <div class="events-page__container">
      <div class="events-page__header">
        <h1 class="events-page__title"> {{ $t('events.title') }}</h1>
        <div class="events-page__description" v-html="$t('events.description')"/>
      </div>
      <div class="events-page__calendar">
        <UiButton
          v-for="day in nextFiveDays"
          :key="day.timestamp"
          theme="date"
          :class="{ 'is-active': selectedDate === day.timestamp }"
          @click="selectDate(day.timestamp)"
        >
          <span class="date-label">
            <span class="date-label__weekday">{{ day.weekday }}</span>
            <span class="date-label__date">{{ day.dateMonth }}</span>
          </span>
        </UiButton>
      </div>
      
      <!-- Liste des événements avec NavBar sticky -->
      <div class="events-page__list-wrapper">
        <div class="events-page__list" ref="listRef">
          <div class="events-page__list-header">
            <h2 class="events-page__list-title">
              {{ isSelectedDateToday() 
                ? $t('events.today', { date: formattedSelectedDate.weekday + ' ' + formattedSelectedDate.dateMonth }) 
                : formattedSelectedDate.weekday + ' ' + formattedSelectedDate.dateMonth 
              }} 
            </h2>
          </div>
        <div class="events-page__list-content">
          <!--<UiAccordions>
            <UiAccordionItem v-for="i in 10" :key="i" :time="'10:00'" :location="'Tadoussac'" :title="'Festival de la chanson<br> de Tadoussac'" :icon="IconPlus">
            </UiAccordionItem>
          </UiAccordions> -->
          <UiAccordions v-if="filteredEvents.length > 0">
            <UiAccordionItem 
              v-for="event in filteredEvents" :key="event.id" 
              :time="{ 'start': event.time_start, end: event.time_end }" 
              :location="event.address" 
              :title="event.title" 
              :icon="IconPlus" 
              @click="toggleEvent(event.id)"
            />
          </UiAccordions>
          <div v-else class="events-page__empty">
            Aucun événement pour cette date
          </div>
        </div>
        
        
      </div>
      
      <UiNavBar 
        :show-scroll-arrows="filteredEvents.length > 5"
        @scrollup="scrollListUp"
        @scrolldown="scrollListDown"
      />
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { store as appStore } from 'plugins/store/app'
import { useSidePanelStore } from 'store/sidePanel'
import IconPlus from 'assets/svg/plus.svg?raw'
import UiButton from 'components/UiKit/Button/index.vue'
import UiAccordions from 'components/UiKit/Accordions/Items.vue'
import UiAccordionItem from 'components/UiKit/EventItem/index.vue'
import UiNavBar from 'components/NavBar/index.vue'
import { useEvents, useDate } from 'composables'

const { t } = useI18n()
const sidePanelStore = useSidePanelStore()

// Utilise les composables pour la gestion des événements
const { 
  selectedDate, 
  filteredEvents, 
  nextFiveDays, 
  formattedSelectedDate, 
  selectDate 
} = useEvents()

const { isToday } = useDate()

const listRef = ref<HTMLElement | null>(null)

/**
 * Vérifie si la date sélectionnée est aujourd'hui
 */
const isSelectedDateToday = () => {
  return isToday(new Date(selectedDate.value))
}

/**
 * Scroll vers le haut dans la liste
 */
const scrollListUp = () => {
  if (listRef.value) {
    listRef.value.scrollBy({ top: -300, behavior: 'smooth' })
  }
}

/**
 * Scroll vers le bas dans la liste
 */
const scrollListDown = () => {
  if (listRef.value) {
    listRef.value.scrollBy({ top: 300, behavior: 'smooth' })
  }
}

/**
 * Ouvre le panel de détail d'un événement
 */
const toggleEvent = (id: number) => {
  appStore.setCurrentEvent(id)
  sidePanelStore.openEvent()
}

</script>

<style lang="stylus" scoped>
  .events-page
    background-color $embruns
    min-height 100vh
    height 100%
    
    &__container
      margin-top 69px
      margin-left 100px
      margin-right 228px
    
    &__header
      f(row, $justify: start, $align: flex-end)
      r(margin-bottom, 80px)
    
    &__title
      f-style('h1')
      width 50%
      r(margin-top, 72px)
    
    &__description
      f-style('small-body')
      text-align left
      width 50%
    
    &__calendar
      display flex
      gap 61px
      r(margin-bottom, 50px)
      background-color white
      r(padding, 100px 110px)
      border-radius $radius-lgxl
      
      .UiButton
        flex 1
      
      .date-label
        display flex
        flex-direction column
        align-items center
        text-transform capitalize
        
        &__weekday
          f-style('subtitle')
        
        &__date
          f-style('subtitle')
    
    &__list-wrapper
      position relative
      margin-bottom 125px
      
      // NavBar positionnée en absolute à droite du listing
      .NavBar
        position absolute
        top 100px
        right -90px  // Sort du listing vers la droite

    &__list
      width 100%
      display flex
      flex-direction column
      gap 16px
      background-color white
      border-radius $radius-lgxl
      r(padding, 100px 110px)
      max-height 2346px
      min-height px
      overflow-y auto
      
    &__list-content
      overflow scroll
    &__list-header
      r(margin-bottom, 100px)
    &__list-title
      f-style('h2')
    &__empty
      f-style('small-body')
      color $fjord
      opacity 0.6
      text-align center
      padding-top 60px
      padding-bottom 100px
    
    &__event
      background white
      border-radius $radius-md
      r(padding, 30px)
      f-style('h5')
      color $fjord
</style>