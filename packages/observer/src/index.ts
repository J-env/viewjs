import {
  noop,
  nextTick as _nextTick,
  hasOwn,
  isFunction,
  defAccessor
} from '@viewjs/shared'

import { __watchers__, __data__ } from './constants'
import {
  createWatch,
  createComputed,
  WatcherExpOrFn,
  WatcherCallback,
  WatchOptions
} from './watcher'

import { ensure } from './handles'

export const nextTick = _nextTick

/**
 * reactive
 * @param target
 * @param shallow
 */
export function reactive(target: object, shallow?: boolean) {
  target = target || {}

  if (hasOwn(target, __watchers__) && hasOwn(target, __data__)) {
    return target
  }

  // 一些准备工作
  ensure(target, shallow)
  return target
}

/**
 * computed
 * @param target
 * @param name
 * @param accessor
 * @param cache
 */
export function computed<T = any>(
  this: T,
  target: object,
  name: PropertyKey,
  accessor: Function | Accessor,
  cache?: boolean
) {
  ensure(target)

  let getter, setter

  if (isFunction(accessor)) {
    getter = cache !== false
      ? createComputed(target, accessor)
      : createGetterInvoker(accessor)

    setter = noop

  } else {
    getter = accessor.get
      ? accessor.cache !== false || cache !== false
        ? createComputed(target, accessor.get)
        : createGetterInvoker(accessor.get)
      : noop

    setter = accessor.set
      ? createGetterInvoker(accessor.set)
      : noop
  }

  defAccessor(target, name, getter, setter)
}

/**
 * watch
 *
 * @param target
 * @param expOrFn
 * @param cb
 * @param opts
 */
export function watch(
  target: object,
  expOrFn: WatcherExpOrFn,
  cb?: WatcherCallback,
  opts?: WatchOptions
): Function {
  ensure(target)
  return createWatch(target as any, expOrFn, cb, opts)
}

function createGetterInvoker(fn: Function) {
  return function computedGetter(this, val?) {
    return fn.call(this, val)
  }
}

type Accessor = {
  get: Function
  set?: Function
  cache?: boolean
}
