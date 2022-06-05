import { isObject } from '@viewjs/shared'

import type { Ref, UnwrapRefSimple } from './ref'

export const reactiveMap = new WeakMap<Target, any>()
export const shallowReactiveMap = new WeakMap<Target, any>()
export const readonlyMap = new WeakMap<Target, any>()
export const shallowReadonlyMap = new WeakMap<Target, any>()

export declare const ShallowReactiveMarker: unique symbol

export const enum ReactiveFlags {
  SKIP = '_v_skip',
  IS_REACTIVE = '_v_isReactive',
  IS_READONLY = '_v_isReadonly',
  IS_SHALLOW = '_v_isShallow',
  RAW = '_v_raw'
}

// const enum TargetType {
//   INVALID = 0,
//   COMMON = 1,
//   COLLECTION = 2
// }

export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  if (isReadonly(target)) {
    return target
  }

  return createReactiveObject(
    target,
    false,
    null,
    null,
    reactiveMap
  )
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any> | null,
  collectionHandlers: ProxyHandler<any> | null,
  proxyMap: WeakMap<Target, any>
) {
  if (!isObject(target)) {
    return target
  }

  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }

  // 已经存在
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  console.log(baseHandlers, collectionHandlers)
}

export function isReactive(value: unknown): boolean {
  if (isReadonly(value)) {
    return isReactive((value as Target)[ReactiveFlags.RAW])
  }

  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}

export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_SHALLOW])
}

export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>
