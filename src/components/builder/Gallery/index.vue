<template>
  <div
    v-if="items && items.length > 0"
    class="BuilderGallery"
    :data-count="items.length"
  >
    <div class="wrapper" :data-count="items.length">
      <div
        v-for="({ type, data }, index) in items"
        :key="`gallery-item-${index}`"
        class="item"
        :data-type="isVideo(type) ? 'video' : 'image'"
      >
        <ui-picture
          v-if="type === MEDIA_TYPES.PICTURE"
          v-bind="data"
          class="media -picture"
          cover="cover"
        />
        <ui-video
          v-if="isVideo(type)"
          class="media -video"
          v-bind="data"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * BuilderGallery
 * 
 * Galerie d'images et vidéos pour le page builder.
 */

import { defineComponent, PropType } from 'vue'

const MEDIA_TYPES = {
  PICTURE: 'image',
  VIDEO: 'video',
  VIDEO_INTERNAL: 'video_internal',
  VIDEO_EXTERNAL: 'video_external',
}

const BuilderGallery = defineComponent({
  name: 'BuilderGallery',
  props: {
    /** Liste des médias (video/image) */
    items: {
      type: Array as PropType<GalleryItem[]>,
      default: () => [],
    },
    /** Configuration */
    configuration: {
      type: Object as PropType<{ fullscreen: boolean }>,
      default: () => ({ fullscreen: false }),
    },
  },
  setup() {
    const isVideo = (type: string) => {
      return (
        type === MEDIA_TYPES.VIDEO ||
        type === MEDIA_TYPES.VIDEO_EXTERNAL ||
        type === MEDIA_TYPES.VIDEO_INTERNAL
      )
    }

    return {
      MEDIA_TYPES,
      isVideo,
    }
  },
})

export default BuilderGallery
</script>

<style lang="stylus" scoped>
.BuilderGallery
  container('pagebuilder')

.wrapper
  &[data-count="2"]
    f(row)
    +layout(mobile)
      flex-wrap wrap

    .item
      width 50%
      rp(margin-right, 40px 0)
      
      &:last-child
        margin-right 0
        margin-bottom 0
      
      +layout(mobile)
        width 100%
        margin-bottom 40px
        margin-right 0

.media
  position relative
  padding-bottom 56.25% // 16:9 ratio
  height 0
  overflow hidden
  
  :deep(> *)
    position absolute
    top 0
    left 0
    width 100%
    height 100%
</style>

