/** simple vec2 point
 * could be used for x/y - lat/long etc
 * **!!! this is an object {x:0.5, y:0.5}**
 */
declare type Point = {
  x: number|0.5,
  y: number|0.5,
  z?: number|0
}
