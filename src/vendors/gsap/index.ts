/**
 * GSAP Configuration
 * 
 * Centralise les imports GSAP pour faciliter la gestion des plugins.
 * Note: Les plugins premium (SplitText, DrawSVG, etc.) nécessitent une licence GSAP.
 */

import gsap, {
  Back, Bounce, Circ, Cubic, Elastic, Expo, Linear,
  Power0, Power1, Power2, Power3, Power4,
  Quad, Quart, Quint, Sine, Strong
} from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

// Enregistrement des plugins
gsap.registerPlugin(CSSPlugin)
gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(ScrollToPlugin)

// Fix pour éviter les bugs de build avec les easings
// @ts-expect-error - Global eases pour éviter les erreurs "Linear not found"
window.eases = {
  Linear, Back, Bounce, Elastic,
  Circ, Cubic, Quad, Quart, Quint, Sine, Strong, Expo,
  Power0, Power1, Power2, Power3, Power4
}

export {
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  // Easings
  Linear, Back, Bounce, Elastic,
  Circ, Cubic, Quad, Quart, Quint, Sine, Strong, Expo,
  Power0, Power1, Power2, Power3, Power4
}

export default gsap

