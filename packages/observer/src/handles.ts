import {
  hasOwn,
  def,
  objectCreate,
  defAccessor,
  eachObject,
  isFunction
} from '@viewjs/web'

import { __data__, __watchers__ } from './constants'
import { observe, defineReactive } from './observe'

export function ensure(target: object, shallow?: boolean) {
  if (!hasOwn(target, __watchers__)) {
    def(target, __watchers__, [], false)
    def(target, __data__, objectCreate(null), false)

    // observe
    observe(target[__data__], shallow)

    // data
    eachObject<Record<PropertyKey, any>>(target, (key, value) => {
      if (!isFunction(value)) {
        reactProperty(target, key, value)

      } else {
        target[key] = value.bind(target)
      }
    })
  }
}

export function reactProperty(target: object, key: PropertyKey, value: any) {
  target[__data__][key] = value
  defineReactive(target[__data__], key, value)
  proxy(target, key)
}

export function proxy(target: object, key: PropertyKey) {
  function getter() {
    return target[__data__][key]
  }

  function setter(value) {
    target[__data__][key] = value
  }

  defAccessor(target, key, getter, setter)
}
