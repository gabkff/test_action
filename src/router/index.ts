import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { appConfig } from 'config'
import { hasApiSiteInCache } from 'plugins/api/apiSite'

/**
 * Configuration du Router Vue
 * 
 * Définit toutes les routes de l'application.
 * Utilise le lazy loading pour optimiser le chargement.
 */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('pages/Home/index.vue'),
  },
  {
    path: '/selectCity',
    name: 'selectCity',
    component: () => import('pages/Selection/city.vue'),
    props: true,
  },
  {
    path: '/selection',
    name: 'selection',
    component: () => import('pages/Selection/index.vue'),
  },
  {
    path: '/circuits',
    name: 'circuits',
    component: () => import('pages/Circuits/index.vue'),
  },
  {
    path: '/circuits/:slug',
    name: 'circuit-single',
    component: () => import('pages/Circuits/step.vue'),
    props: true,
  },
  {
    path: '/evenements',
    name: 'events',
    component: () => import('pages/Evenements/index.vue'),
  },
  {
    path: '/evenement/:slug',
    name: 'event-single',
    component: () => import('pages/Evenements/single.vue'),
    props: true,
  },
  {
    path: '/uikit',
    name: 'uikit',
    component: () => import('pages/UiKit/index.vue'),
  },

  // Route 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// Mode tablette : sans site en cache, rediriger vers la page de sélection
router.beforeEach((to) => {
  if (appConfig.mode === 'ipad' && !hasApiSiteInCache() && to.path !== '/selectCity') {
    return { path: '/selectCity' }
  }
  return true
})

export default router
