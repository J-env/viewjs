import { isNative, noop } from '@viewjs/shared'

import { isIE, isIOS } from './ua'

const callbacks: Function[] = []

let pending = false

function flushCallbacks() {
  pending = false

  const copy_cbs = callbacks.slice(0)
  // clean
  callbacks.length = 0

  const length = copy_cbs.length

  for (let i = 0; i < length; i++) {
    copy_cbs[i]()
  }
}

const hasPromise = typeof Promise !== 'undefined'

const timerFunc = createTimerFunc()

/**
 * use callback
 *
 * @use nextTick(function () {})
 * @use nextTick(function () {}, {})
 */
export function nextTick<T>(cb: () => any): void
export function nextTick<T>(cb: (this: T) => any, ctx: T): void

/**
 * use Promise
 *
 * @use nextTick().then
 * @use nextTick(null).then
 * @use nextTick(null, {}).then
 * @use nextTick(undefined).then
 * @use nextTick(undefined, {}).then
 */
export function nextTick<T>(): Promise<T>
export function nextTick<T>(cb: undefined | null): Promise<T>
export function nextTick<T>(cb: undefined | null, ctx: T): Promise<T>
export function nextTick<T>(cb?: undefined | null | ((this: T) => any) | (() => any), ctx?: T): Promise<T> | void {
  let _resolve: Function

  callbacks.push(() => {
    if (cb) {
      cb.call(ctx as T)

    } else {
      _resolve && _resolve(ctx)
    }
  })

  if (!pending) {
    pending = true
    timerFunc()
  }

  if (hasPromise && !cb) {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

nextTick._microTask = false

// ==================================================================
// ==================================================================
// Here we have async deferring wrappers using microtasks.
// ==================================================================
// 这里我们有使用微任务的异步延迟包装器
// ==================================================================
function createTimerFunc() {
  // 1. use Promise
  // ==================================================================
  if (hasPromise && isNative(Promise)) {
    const p = Promise.resolve()

    const fn = () => {
      p.then(flushCallbacks)

      // ios bug fix
      isIOS && setTimeout(noop)
    }

    nextTick._microTask = true
    return fn
  }

  // 2. use MutationObserver
  // ==================================================================
  if (
    !isIE && typeof MutationObserver !== 'undefined'
    && (
      isNative(MutationObserver) ||
      // PhantomJS and iOS 7.x
      MutationObserver.toString().indexOf('MutationObserverConstructor') >= 0
    )
  ) {
    // Use MutationObserver where native Promise is not available,
    // e.g. PhantomJS, iOS7, Android 4.4
    // (#6466 MutationObserver is unreliable in IE11)
    let counter = 1

    // textNode.data 发生变化 MutationCallback 就会执行
    // MutationObserver 是微任务
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(counter + '')

    observer.observe(textNode, {
      characterData: true
    })

    const fn = () => {
      counter = (counter + 1) % 2
      textNode.data = counter + ''
    }

    nextTick._microTask = true
    return fn
  }

  // 3. use setImmediate
  // ==================================================================
  if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // Fallback to setImmediate.
    // Technically it leverages the (macro) task queue,
    // but it is still a better choice than setTimeout.
    return () => {
      setImmediate(flushCallbacks)
    }
  }

  // 4. Fallback to setTimeout
  return () => {
    setTimeout(flushCallbacks, 0)
  }
}
