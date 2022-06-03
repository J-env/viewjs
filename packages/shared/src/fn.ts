export function noop() { }

export const raf = (window.requestAnimationFrame ||
  window['webkitRequestAnimationFrame'] ||
  window['mozRequestAnimationFrame'] ||
  setTimeout) as (fn: Function) => number

export const caf = (window.cancelAnimationFrame ||
  window['webkitCancelAnimationFrame'] ||
  window['mozCancelAnimationFrame'] ||
  clearTimeout) as (id: number) => void
