/**
 * Opacity Animation
 * 
 * Animation d'opacité avec fallback CSS si GSAP n'est pas disponible.
 */

export default class OpacityAnimation {
  el?: HTMLElement
  tl?: gsap.core.Timeline
  gsapModule?: typeof import('vendors/gsap')

  constructor(els: { el?: HTMLElement }) {
    this.el = els.el
    this.init()
    return this
  }

  async init() {
    if (!this.el) return

    // Try to load GSAP
    try {
      this.gsapModule = await import('vendors/gsap')
      this.initGsap()
    } catch {
      // Fallback to CSS
      this.initCss()
    }
  }

  initGsap() {
    if (!this.el || !this.gsapModule) return

    const { gsap } = this.gsapModule
    
    gsap.set(this.el, { alpha: 0, y: 20 })

    this.tl = gsap.timeline({
      paused: true,
      autoRemoveChildren: false,
      repeatRefresh: true,
    })
      .fromTo(this.el,
        { alpha: 0, y: 20 },
        { alpha: 1, y: 0, delay: 0.5, duration: 0.6, ease: 'power2.out' }
      )
  }

  initCss() {
    if (!this.el) return
    this.el.style.opacity = '0'
    this.el.style.transform = 'translateY(20px)'
    this.el.style.transition = 'opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s'
  }

  enter = () => {
    if (this.tl) {
      this.tl.timeScale(1).play(0)
    } else if (this.el) {
      this.el.style.opacity = '1'
      this.el.style.transform = 'translateY(0)'
    }
  }

  display = () => {
    if (this.tl) {
      this.tl.totalProgress(1, false)
    } else if (this.el) {
      this.el.style.transition = 'none'
      this.el.style.opacity = '1'
      this.el.style.transform = 'translateY(0)'
    }
  }

  update = () => {
    // Placeholder for resize updates
  }

  leave = () => {
    if (this.tl) {
      this.tl.timeScale(2).reverse()
    } else if (this.el) {
      this.el.style.opacity = '0'
      this.el.style.transform = 'translateY(20px)'
    }
  }

  dispose() {
    this.tl?.kill()
    this.tl = undefined
  }
}
