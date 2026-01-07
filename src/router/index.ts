import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
    path: '/circuits',
    name: 'circuits',
    component: () => import('pages/Circuits/index.vue'),
  },
  {
    path: '/circuit/:slug',
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
    path: '/:slug',
    name: 'dynamic-page',
    component: () => import('pages/DynamicPage/index.vue'),
    props: true,
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

export default router
