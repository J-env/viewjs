import {
  isObject,
  isArray,
  isPlainObject,
  isExtensible,
  hasOwn,
  getOwnPropertyDescriptor,
  eachObject,
  def,
  defAccessor,
  hasChanged
} from '@viewjs/shared'

import { __ob__ } from './constants'
import { setProtoOfArray } from './array'
import { Dep } from './dep'

export function observe(value: object, shallow?: boolean): Observer | void {
  if (!isObject(value)) {
    return
  }

  // 已经存在
  if (hasOwn(value, __ob__) && (value[__ob__] instanceof Observer)) {
    return value[__ob__]
  }

  // 原始数组，原始对象
  if ((isArray(value) || isPlainObject(value)) && isExtensible(value)) {
    return new Observer(value, shallow)
  }
}

export function defineReactive(
  obj: object,
  key: PropertyKey,
  val: any,
  shallow?: boolean
) {
  const dep = new Dep()

  const desc = getOwnPropertyDescriptor(obj, key)
  if (desc && desc.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = desc && desc.get
  const setter = desc && desc.set

  let childOb = !shallow && observe(val)

  function get() {
    const value = getter ? getter.call(obj) : val

    if (Dep.target) {
      dep.depend()

      if (childOb) {
        childOb.dep.depend();
        isArray(value) && dependArray(value);
      }
    }

    return value
  }

  function set(newVal) {
    const value = getter ? getter.call(obj) : val

    if (!hasChanged(value, newVal)) {
      return
    }

    // 用于没有setter的访问器属性
    if (getter && !setter) {
      return
    }

    if (setter) {
      setter.call(obj, newVal)

    } else {
      val = newVal
    }

    childOb = !shallow && observe(newVal)
    dep.notify()
  }

  defAccessor(obj, key, get, set)
  // return dep
}

export class Observer {
  dep: Dep

  constructor(value: any, shallow?: boolean) {
    shallow = shallow || false

    this.dep = new Dep()

    def(value, __ob__, this)

    if (isArray(value)) {
      // 将数组的突变方法添加到数组的原型上 setPrototypeOf()
      setProtoOfArray(value)

      // observe []
      !shallow && this.observeArray(value)

    } else {
      // observe {}
      this.walk(value, shallow)
    }
  }

  walk(obj: object, shallow: boolean) {
    eachObject(obj, (key, value) => {
      defineReactive(obj, key, value, shallow)
    })
  }

  observeArray(items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

function dependArray(value: any[]) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e[__ob__] && e[__ob__].dep.depend();
    isArray(e) && dependArray(e);
  }
}
