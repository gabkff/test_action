/**
 * init modernizr
 * + detect devices with Detectizr
 * 
 * some detections need time (webp)
 * o we will compute support tests within InterfaceStore
 *
 * @todo :
 * - [ ] implement [this](https://www.npmjs.com/package/modernizr-webpack-plugin)
 */
import './detectizr';
import './modernizr';

 declare global { interface Window { Modernizr:Modernizr, Detectizr:Detectizr } }
 export const Modernizr:Modernizr = window.Modernizr  
 export const Detectizr:Detectizr = window.Detectizr  
 interface Modernizr {
   touchevents: boolean
   webgl: any
   /* need time to be computed
   also strange Boolean {true, alpha: true, animation: true, lossless: true}
   use .valueOf()
   */
   webp: any,
   [key:string]:boolean
 }
 interface Detectizr {
   browser: {
     engine: string
     language: string
     major: string
     minor: string
     name: string
     patch: string
     plugins: any[]
     userAgent: string
     version: string
   }
   device:{
     model: string
     orientation: string
     type: "mobile" | "tablet" | "desktop"
     screen:Obj
   }
   os:{
     addressRegisterSize: string
     major: string
     minor: string
     name: string
     patch: string
     version: string
   }
   init: ()=>any
   detect: ()=>any
 }
 
 // // we do know that safari13 bad support webp
 // const isSafari13AndBelow = Detectizr.browser.name === 'safari' && parseInt(Detectizr.browser.major, 10) <= 13
 // const detections = {
 //   ...Detectizr,
 //   tests: {
 //     ...Modernizr,
 //     touch: Modernizr.touchevents,
 //     webp: Modernizr.webp?.valueOf() && !isSafari13AndBelow,// need delay in front - will compute in interfaceStore strange Boolean {true, alpha: true, animation: true, lossless: true}
 //   },
 //   // // @guitoux - est-ce qu'on se base sur ca ou modernizr.touchevents c'est correct ?
 //   // isTouchDevice: ():boolean => {
 //   //   return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia("(pointer: coarse)").matches
 //   // }
 // }
 
 
 // export default detections
 