const TAP_THRESHOLD_PX = 10

export const tapDirective = {
  mounted(el: HTMLElement, binding: { value: (e: PointerEvent) => void }) {
    let startX = 0
    let startY = 0

    const onDown = (e: PointerEvent) => {
      startX = e.clientX
      startY = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (dx * dx + dy * dy <= TAP_THRESHOLD_PX * TAP_THRESHOLD_PX && binding.value) {
        binding.value(e)
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    ;(el as any)._tapCleanup = () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
    }
  },
  unmounted(el: HTMLElement) {
    ;(el as any)._tapCleanup?.()
  },
}