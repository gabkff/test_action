/**
 * InterfaceStore
 * our store about interface (window size, browser supports etc)
 */
import { DEBUG, motion } from 'config';
import { throttle } from 'lodash';
import { defineStore } from 'pinia';
import { pinia } from 'plugins/store/index';
import { computed, nextTick, ref } from 'vue';
type Supports = {
  touch: boolean,
  webp: boolean,
  webgl: boolean,
  isFirefox: boolean,
}
interface Interface extends Obj {
  ready: boolean,
  viewport: { width: number, height: number, innerHeight: number, webglHeight: number }
  device: 'mobile' | 'tablet' | 'desktop',
  /* list features supported by browser */
  supports: Supports
  disabled:boolean;
}

const useStore = defineStore('interface', () => {
  const state = ref<Interface>({
    ready: false,
    /** @argument {Object} viewport - uptodate viewport sizes */
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight, // stay always the same
      innerHeight: window.innerHeight, // updates on scroll
      webglHeight: window.innerHeight
    },
    /** @argument {Object} device - Detectizr device */
    device: 'mobile',
    supports: {
      touch: true,
      webp: true,
      webgl: true,
      isFirefox: false,
    },
    disabled:false
  });


  const support = (feature: keyof Supports) => {
    return state.value.supports[feature];
  }

  const init = async () => {

    // add some dataset to html for usefull tests (`html[data-motion="true"] &`)
    document.documentElement.dataset.client = 'true'
    document.documentElement.dataset.motion = 'true'
    // document.documentElement.dataset.server = server.toString()

    // Patch for webgl resize on mobile
    setTimeout(() => {
      const webglWrapper = document.querySelector('#WEBGL_WRAPPER');
      const rect = webglWrapper?.getBoundingClientRect();
      if (rect?.height) {
        state.value.viewport.webglHeight = rect.height;
      }
    }, 200);

    window.addEventListener('resize', throttle(() => {
      state.value.viewport.width = window.innerWidth;
      state.value.viewport.height = document.documentElement.offsetHeight;
      state.value.viewport.innerHeight = window.innerHeight;

      // Patch for webgl resize on mobile
      const webglWrapper = document.querySelector('#WEBGL_WRAPPER');
      const rect = webglWrapper?.getBoundingClientRect();

      if (rect?.height && state.value.viewport.webglHeight !== rect.height) {
        state.value.viewport.webglHeight = rect.height;
      }
    }, 0));

    useModernizr();
    state.value.ready = true;
    // appStore.setInterfaceReady()
  }

  const useModernizr = async () => {
    const { Modernizr, Detectizr } = await import(/* webpackChunkName: "vendor-modernizr" */'vendors/modernizr')

    state.value.device = Detectizr.device.type
    // supports may take some time to compute...
    // also, we may ensure some supports here
    return nextTick(() => {
      const { name, major } = Detectizr.browser
      // Modernizr est weird, pas stable, on assume qu'on webp est supporter partout sauf pour <safari13 
      
      const { touchevents, webgl, /* webp */ } = Modernizr
      const webp = true;
      const webp_safe = (() => {
        const isSafari13AndBelow = name === 'safari' && parseInt(major, 10) <= 13
        return webp?.valueOf() && !isSafari13AndBelow
      })()

      const isFirefox = name === 'firefox';

      const touch_safe = touchevents && state.value.device !== 'desktop'
      state.value.supports = {
        webgl,
        touch: touchevents,
        webp: webp_safe,
        isFirefox
      }

      // also add `.no-touch` in `<html>` so .no-touch is always true on desktop event for touch ones
      // vs .no-touchevent may still be true on such devices

      document.documentElement.classList.add(name)
      document.documentElement.classList.add(state.value.device)
      document.documentElement.classList.add(`${motion ? '' : 'no-'}motion`)
      document.documentElement.classList.add(`client`)
      document.documentElement.classList.add(`${webp_safe ? '' : 'no-'}webp-safe`)
      document.documentElement.classList.add(`${touch_safe ? '' : 'no-'}touch`)
      state.value.ready = true;
      //appStore.setInterfaceReady()
    });
  }

  /**
   * Use when we switch pages and during animation page transition, we can disable all user interactions
   * @param value 
   */
  const toggleDisabled = (value:boolean) => {
    state.value.disabled = value;
  }

  return {
    state,

    //getters
    // those values are sync with our koddein styling settings... be carefull with those
    isMobile: computed(() => state.value.viewport.width <= 1024),
    isTablet: computed(() => state.value.viewport.width > 600 && state.value.viewport.width < 1280),
    isDesktop: computed(() => state.value.viewport.width >= 1280),
    // just like our +layout(desktop)
    isLayoutDesktop: computed(() => state.value.viewport.width >= 1000),
    isDesktopDevice: computed(() => state.value.device === 'desktop'),
    viewport: computed(() => state.value.viewport),
    hasTouch: computed( () => state.value.supports.touch),
    disabled: computed( () => state.value.disabled),

    //actions
    init,
    support,
    toggleDisabled,
  }
});

export const store = useStore(pinia);
export default store;

// @ts-expect-error
if(DEBUG) window.interface = store
