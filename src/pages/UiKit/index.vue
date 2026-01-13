<template>
  <div class="UiKitPage">
    <header class="UiKitPage__header">
      <h1 class="UiKitPage__title">UI Kit - Style Guide</h1>
      <p class="UiKitPage__subtitle">Typographies, couleurs et composants du design system</p>
    </header>

    <!-- Section Typographies -->
    <section class="UiKitPage__section">
      <h2 class="UiKitPage__sectionTitle">Typographies</h2>
      
      <div class="UiKitPage__grid">
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">h0</span>
          <p class="typo-h0">Heading 0</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">h1</span>
          <p class="typo-h1">Heading 1</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">h2</span>
          <p class="typo-h2">Heading 2</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">h3</span>
          <p class="typo-h3">Heading 3 - Section</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">h4</span>
          <p class="typo-h4">Heading 4</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">default</span>
          <p class="typo-default">Texte par défaut - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">subtitle</span>
          <p class="typo-subtitle">Sous-titre texte</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">button</span>
          <p class="typo-button">Texte bouton</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">big</span>
          <p class="typo-big">Big</p>
        </div>
        
        <div class="UiKitPage__typoItem">
          <span class="UiKitPage__typoLabel">wysiwyg</span>
          <div class="typo-wysiwyg">
            <p>Texte WYSIWYG - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Couleurs -->
    <section class="UiKitPage__section">
      <h2 class="UiKitPage__sectionTitle">Couleurs</h2>
      
      <!-- Neutral -->
      <h3 class="UiKitPage__colorGroupTitle">Neutral</h3>
      <div class="UiKitPage__colorGrid">
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--white"></div>
          <span class="UiKitPage__colorName">$white</span>
          <span class="UiKitPage__colorValue">#ffffff</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--light"></div>
          <span class="UiKitPage__colorName">$light</span>
          <span class="UiKitPage__colorValue">#F2F2F2</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--darkest"></div>
          <span class="UiKitPage__colorName">$darkest</span>
          <span class="UiKitPage__colorValue">#0D0C0C</span>
        </div>
      </div>

      <!-- Theme General -->
      <h3 class="UiKitPage__colorGroupTitle">Theme Général</h3>
      <div class="UiKitPage__colorGrid">
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--embruns"></div>
          <span class="UiKitPage__colorName">$embruns</span>
          <span class="UiKitPage__colorValue">#F6F2F0</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--remousLight"></div>
          <span class="UiKitPage__colorName">$remous-light</span>
          <span class="UiKitPage__colorValue">#E7F6F5</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--remous"></div>
          <span class="UiKitPage__colorName">$remous</span>
          <span class="UiKitPage__colorValue">#C4F0EB</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--bouleauLight"></div>
          <span class="UiKitPage__colorName">$bouleau-light</span>
          <span class="UiKitPage__colorValue">#FFF0D6</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--bouleau"></div>
          <span class="UiKitPage__colorName">$bouleau</span>
          <span class="UiKitPage__colorValue">#FFBC47</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--fjord"></div>
          <span class="UiKitPage__colorName">$fjord</span>
          <span class="UiKitPage__colorValue">#102838</span>
        </div>
      </div>

      <!-- Theme Floral -->
      <h3 class="UiKitPage__colorGroupTitle">Theme Floral</h3>
      <div class="UiKitPage__colorGrid">
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--aurore"></div>
          <span class="UiKitPage__colorName">$aurore</span>
          <span class="UiKitPage__colorValue">#FCECE5</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--crepuscule"></div>
          <span class="UiKitPage__colorName">$crepuscule</span>
          <span class="UiKitPage__colorValue">#FF8D66</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--lupin"></div>
          <span class="UiKitPage__colorName">$lupin</span>
          <span class="UiKitPage__colorValue">#725DA0</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--penombre"></div>
          <span class="UiKitPage__colorName">$penombre</span>
          <span class="UiKitPage__colorValue">#2D1F34</span>
        </div>
      </div>

      <!-- Theme Foret -->
      <h3 class="UiKitPage__colorGroupTitle">Theme Forêt</h3>
      <div class="UiKitPage__colorGrid">
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--ecume"></div>
          <span class="UiKitPage__colorName">$ecume</span>
          <span class="UiKitPage__colorValue">#DAEAE8</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--fleuve"></div>
          <span class="UiKitPage__colorName">$fleuve</span>
          <span class="UiKitPage__colorValue">#00DEC4</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--lichen"></div>
          <span class="UiKitPage__colorName">$lichen</span>
          <span class="UiKitPage__colorValue">#578F67</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--epinette"></div>
          <span class="UiKitPage__colorName">$epinette</span>
          <span class="UiKitPage__colorValue">#172E20</span>
        </div>
      </div>

      <!-- Theme Feuillage -->
      <h3 class="UiKitPage__colorGroupTitle">Theme Feuillage</h3>
      <div class="UiKitPage__colorGrid">
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--lueur"></div>
          <span class="UiKitPage__colorName">$lueur</span>
          <span class="UiKitPage__colorValue">#FFEAC6</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--falaise"></div>
          <span class="UiKitPage__colorName">$falaise</span>
          <span class="UiKitPage__colorValue">#8E5846</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--baie"></div>
          <span class="UiKitPage__colorName">$baie</span>
          <span class="UiKitPage__colorValue">#3F0F0B</span>
        </div>
      </div>

      <!-- Theme Glace -->
      <h3 class="UiKitPage__colorGroupTitle">Theme Glace</h3>
      <div class="UiKitPage__colorGrid">
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--brume"></div>
          <span class="UiKitPage__colorName">$brume</span>
          <span class="UiKitPage__colorValue">#F8F3FF</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--aube"></div>
          <span class="UiKitPage__colorName">$aube</span>
          <span class="UiKitPage__colorValue">#B9B0FF</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--glacier"></div>
          <span class="UiKitPage__colorName">$glacier</span>
          <span class="UiKitPage__colorValue">#3B7081</span>
        </div>
      </div>

      <!-- Status Colors -->
      <h3 class="UiKitPage__colorGroupTitle">Status</h3>
      <div class="UiKitPage__colorGrid">
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--success"></div>
          <span class="UiKitPage__colorName">$success</span>
          <span class="UiKitPage__colorValue">#10b981</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--warning"></div>
          <span class="UiKitPage__colorName">$warning</span>
          <span class="UiKitPage__colorValue">#f59e0b</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--error"></div>
          <span class="UiKitPage__colorName">$error</span>
          <span class="UiKitPage__colorValue">#ef4444</span>
        </div>
        <div class="UiKitPage__colorItem">
          <div class="UiKitPage__colorSwatch UiKitPage__colorSwatch--info"></div>
          <span class="UiKitPage__colorName">$info</span>
          <span class="UiKitPage__colorValue">#3b82f6</span>
        </div>
      </div>
    </section>

    <!-- Section Composants -->
    <section class="UiKitPage__section">
      <h2 class="UiKitPage__sectionTitle">Composants</h2>
      
      <!-- Buttons -->
      <h3 class="UiKitPage__componentTitle">Buttons</h3>
      <div class="UiKitPage__componentDemo">
        <UiButton label="Primary" theme="primary" />
        <UiButton label="Secondary" theme="secondary" />
        <UiButton label="Link" theme="link" />
        <UiButton theme="primary" :icon="IconPlus" label="icon">
        </UiButton>
        <UiButton theme="icon" :icon="IconInfo"/>
        <UiButton label="Primary big" theme="primary" :big="true" />
        <UiButton label="Disabled" theme="primary" disabled />
        <UiButton label="Loading" theme="primary" loading />
      </div>

      <!-- Accordion -->
      <h3 class="UiKitPage__componentTitle">Accordion</h3>
      <div class="UiKitPage__componentDemo UiKitPage__componentDemo--full"> 
        <UiAccordions :multiple="true">
          <UiAccordionItem title="Premier élément" :icon="IconPlus">
            <div class="wysiwyg">Contenu du premier élément de l'accordéon. Lorem ipsum dolor sit amet.</div>
          </UiAccordionItem>
          <UiAccordionItem title="Deuxième élément">
            <div class="wysiwyg">Contenu du deuxième élément de l'accordéon. Consectetur adipiscing elit.</div>
          </UiAccordionItem>
        </UiAccordions>
      </div>

      <!-- UiSelector -->
      <h3 class="UiKitPage__componentTitle">Selector</h3>
      <div class="UiKitPage__componentDemo UiKitPage__componentDemo--full" :style="{ 'background-color': '#0D0C0C', 'gap': '16px', 'display': 'flex', 'flex-direction': 'column' }">
        <UiSelector
            v-model="selectedLang"
            :options="[
            { value: 'fr', label: 'FR' },
            { value: 'en', label: 'EN' }
            ]"
            @change="(value, option) => onLangChange(value as string, option)"
        />
        <UiSelector
            theme="secondary"
            v-model="selectedView"
            :options="[
            { value: 'grid', icon: IconMap, label: 'carte'},
            { value: 'list', label: 'liste', icon: IconList }
            ]"
            @change="(value, option) => onLangChange(value as string, option)"
        />
      </div>

      <!-- Tags -->
      <h3 class="UiKitPage__componentTitle">Tags</h3>
      <div class="UiKitPage__componentDemo":style="{'background-color': 'black'}">
        <UiTag label="Tag" />
        <UiTag label="Tag" :icon="IconWalk"/>
        <UiTag :icon="IconInfo"/>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * Page UI Kit
 * 
 * Style guide affichant les typographies, couleurs et composants du design system.
 * Accessible uniquement en développement.
 */

import UiButton from 'components/UiKit/Button/index.vue'
import UiAccordions from 'components/UiKit/Accordions/Items.vue'
import UiAccordionItem from 'components/UiKit/Accordions/Item.vue'
import UiTag from 'components/UiKit/Tag/index.vue'
import UiSelector, { SelectorOption } from 'components/ui/Selector.vue'
import IconPlus from 'assets/svg/plus.svg?raw'
import IconMap from 'assets/svg/pin.svg?raw'
import IconList from 'assets/svg/list.svg?raw'
import IconWalk from 'assets/svg/walk.svg?raw'
import IconInfo from 'assets/svg/info.svg?raw'
import { ref } from 'vue'

const marqueeTexts = ['Element 1', 'Element 2', 'Element 3', 'Element 4']
const selectedLang = ref('fr')
const selectedView = ref('grid')
function onLangChange(value: string, option: SelectorOption) {
  console.log('Langue changée:', value, option)
}
function onViewChange(value: string, option: SelectorOption) {
  console.log('Vue changée:', value, option)
}
</script>

<style lang="stylus" scoped>
.UiKitPage
  padding 40px
  max-width 1400px
  margin 0 auto
  background $bg-primary
  min-height 100vh

  &__header
    text-align center
    margin-bottom 60px
    padding-bottom 40px
    border-bottom 1px solid $border-color

  &__title
    f-style('h1')
    color $text-primary
    margin-bottom 12px

  &__subtitle
    f-style('text18')
    color $text-secondary

  &__section
    margin-bottom 80px

  &__sectionTitle
    f-style('h2')
    color $text-primary
    margin-bottom 40px
    padding-bottom 16px
    border-bottom 2px solid $primary

  // Typographies
  &__grid
    display flex
    flex-direction column
    gap 32px

  &__typoItem
    padding 24px
    background $bg-secondary
    border-radius 8px
    border 1px solid $border-color

  &__typoLabel
    display block
    f-style('text12')
    color $text-muted
    margin-bottom 12px

  // Colors
  &__colorGroupTitle
    f-style('h4')
    color $text-primary
    margin-top 32px
    margin-bottom 16px

  &__colorGrid
    display grid
    grid-template-columns repeat(auto-fill, minmax(150px, 1fr))
    gap 16px

  &__colorItem
    text-align center

  &__colorSwatch
    width 100%
    height 80px
    border-radius 8px
    margin-bottom 8px
    border 1px solid $border-color

    // Neutral
    &--white
      background $white
    &--light
      background $light
    &--darkest
      background $darkest

    // Theme General
    &--embruns
      background $embruns
    &--remousLight
      background $remous-light
    &--remous
      background $remous
    &--bouleauLight
      background $bouleau-light
    &--bouleau
      background $bouleau
    &--fjord
      background $fjord

    // Theme Floral
    &--aurore
      background $aurore
    &--crepuscule
      background $crepuscule
    &--lupin
      background $lupin
    &--penombre
      background $penombre

    // Theme Foret
    &--ecume
      background $ecume
    &--fleuve
      background $fleuve
    &--lichen
      background $lichen
    &--epinette
      background $epinette

    // Theme Feuillage
    &--lueur
      background $lueur
    &--falaise
      background $falaise
    &--baie
      background $baie

    // Theme Glace
    &--brume
      background $brume
    &--aube
      background $aube
    &--glacier
      background $glacier

    // Status
    &--success
      background $success
    &--warning
      background $warning
    &--error
      background $error
    &--info
      background $info

  &__colorName
    display block
    f-style('text14')
    color $text-primary
    font-weight $fw-medium

  &__colorValue
    display block
    f-style('text12')
    color $text-muted

  // Components
  &__componentTitle
    f-style('h4')
    color $text-primary
    margin-top 40px
    margin-bottom 20px

  &__componentDemo
    f(row, $wrap: wrap)
    gap 16px
    padding 32px
    background $bg-secondary
    border-radius 8px
    border 1px solid $border-color

    &--full
      display block

// Typography classes
.typo-h0
  f-style('h0')
  color $text-primary

.typo-h1
  f-style('h1')
  color $text-primary

.typo-h2
  f-style('h2')
  color $text-primary

.typo-h3
  f-style('h3')
  color $text-primary

.typo-h4
  f-style('h4')
  color $text-primary

.typo-default
  f-style('default')
  color $text-primary

.typo-subtitle
  f-style('subtitle')
  color $text-primary

.typo-button
  f-style('button')
  color $text-primary

.typo-btn-large
  f-style('btn-large')
  color $text-primary

.typo-btn-medium
  f-style('btn-medium')
  color $text-primary

.typo-wysiwyg
  f-style('wysiwyg')
  color $text-primary

.typo-small-body
  f-style('small-body')
  color $text-primary

.typo-bold-infos
  f-style('bold-infos')
  color $text-primary

.typo-small-text
  f-style('small-text')
  color $text-primary
</style>

