/**
 * Types pour le système de builder
 */

declare interface BuilderComponent {
  component: string
  data: Record<string, unknown>
}

declare interface Link {
  label?: string
  url?: string
  href?: string
  target?: '_blank' | '_self' | 'internal' | 'external'
}

declare interface AccordionItem {
  title: string
  content: string
}

declare interface Accordions {
  items: AccordionItem[]
}

declare interface BuilderGalleryItems {
  type: 'image' | 'video' | 'video_internal' | 'video_external'
  data: Record<string, unknown>
}

declare interface ImageDetail {
  original?: {
    url: string
    sizes: { width: number; height: number }
  }
  focalPoint?: { x: number; y: number }
  optimized?: {
    standard?: Record<string, string>
    webp?: Record<string, string>
  }
}

declare interface AnimationInterface {
  el?: HTMLElement
  tl?: gsap.core.Timeline
  init(): void
  enter(): void
  leave(): void
  update?(): void
  display?(): void
  dispose(): void
}
