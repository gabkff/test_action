<template>
  <div class="dynamic-page">
    <nav class="breadcrumb">
      <router-link to="/">← {{ $t('common.backToHome') }}</router-link>
    </nav>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="!page" class="not-found">
      <h1>404</h1>
      <p>{{ $t('common.pageNotFound') }}</p>
      <router-link to="/" class="home-link">{{ $t('common.backToHome') }}</router-link>
    </div>

    <div v-else class="page-content">
      <header class="page-header">
        <h1>{{ page.title }}</h1>
        <div class="page-meta">
          <span>{{ $t('common.createdAt') }}: {{ formatDate(page.dates.created) }}</span>
          <span>{{ $t('common.updatedAt') }}: {{ formatDate(page.dates.updated) }}</span>
        </div>
      </header>

      <!-- Utilise le PageBuilder pour rendre les blocs -->
      <PageBuilder
        v-if="builderComponents.length"
        :components="builderComponents"
        class="blocks-container"
      />

      <div v-if="page.translations && page.translations.length > 0" class="translations">
        <h3>{{ $t('common.availableTranslations') }}</h3>
        <ul>
          <li v-for="translation in page.translations" :key="translation.siteId">
            {{ translation.language }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from 'store/app'
import PageBuilder from 'components/builder/index.vue'
import type { Block } from 'types/api.types'

const route = useRoute()
const store = useAppStore()
const { isLoading } = storeToRefs(store)

const slug = computed(() => route.params.slug as string)
const page = computed(() => store.getPageBySlug(slug.value))

/**
 * Transforme les blocs de l'API en format BuilderComponent
 * Block (API) -> BuilderComponent (PageBuilder)
 */
const builderComponents = computed<BuilderComponent[]>(() => {
  if (!page.value?.blocs) return []
  
  return page.value.blocs.map((block: Block) => ({
    // Le type du bloc devient le nom du composant
    // Ex: 'hero' -> 'component_hero' -> BuilderHero
    component: `component_${block.type}`,
    // Le contenu devient les data du composant
    data: {
      id: block.id,
      ...block.content
    }
  }))
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('fr-FR')
}

// Recharge si le slug change
watch(slug, () => {
  // La page est déjà chargée via le store
  // Scroll to top lors du changement de page
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

onMounted(() => {
  // Si aucune donnée n'est chargée, rediriger vers l'accueil
  if (!store.apiData) {
    // Router push home
  }
})
</script>

<style lang="stylus" scoped>
.dynamic-page
  min-height: 100vh

.breadcrumb
  padding: 1rem 2rem
  background: #f8f9fa
  border-bottom: 1px solid #e0e0e0

  a
    color: #667eea
    text-decoration: none
    font-weight: 600

    &:hover
      text-decoration: underline

.loading
  text-align: center
  padding: 4rem 0

.spinner
  border: 4px solid #f3f3f3
  border-top: 4px solid #667eea
  border-radius: 50%
  width: 50px
  height: 50px
  animation: spin 1s linear infinite
  margin: 0 auto 1rem

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

.not-found
  text-align: center
  padding: 4rem 2rem

  h1
    font-size: 4rem
    color: #667eea
    margin-bottom: 1rem

.home-link
  display: inline-block
  margin-top: 2rem
  padding: 1rem 2rem
  background: #667eea
  color: white
  text-decoration: none
  border-radius: 8px
  font-weight: 600

.page-content
  max-width: 1400px
  margin: 0 auto

.page-header
  padding: 3rem 2rem
  text-align: center
  background: linear-gradient(to bottom, #f8f9fa, white)

  h1
    font-size: 3rem
    color: #333
    margin-bottom: 1rem

.page-meta
  display: flex
  gap: 2rem
  justify-content: center
  color: #666
  font-size: 0.9rem

.blocks-container
  display: flex
  flex-direction: column

.translations
  max-width: 1200px
  margin: 2rem auto
  padding: 2rem
  background: #f8f9fa
  border-radius: 8px

  h3
    margin-bottom: 1rem
    color: #333

  ul
    list-style: none
    padding: 0
    display: flex
    gap: 1rem

  li
    padding: 0.5rem 1rem
    background: white
    border-radius: 6px
    color: #667eea
    font-weight: 600
</style>
