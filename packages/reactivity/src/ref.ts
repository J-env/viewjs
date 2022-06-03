import type { CollectionTypes } from './collectionHandlers'
import type { ShallowReactiveMarker } from './reactive'

// types
declare const RefSymbol: unique symbol

export declare const RawSymbol: unique symbol

export interface Ref<T = any> {
  value: T
  [RefSymbol]: true
}

type BaseTypes = string | number | boolean

export interface RefUnwrapBailTypes { }

declare const ShallowRefMarker: unique symbol

export type ShallowRef<T = any> = Ref<T> & {
  [ShallowRefMarker]?: true
}

export type UnwrapRef<T> = T extends ShallowRef<infer V>
  ? V
  : T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

export type UnwrapRefSimple<T> = T extends
  | Function
  | CollectionTypes
  | BaseTypes
  | Ref
  | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  | {
    [RawSymbol]?: true
  }
  ? T
  : T extends Array<any>
  ? {
    [K in keyof T]: UnwrapRefSimple<T[K]>
  }
  : T extends object & {
    [ShallowReactiveMarker]?: never
  }
  ? {
    [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>
  }
  : T
