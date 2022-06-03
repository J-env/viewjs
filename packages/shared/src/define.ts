export const defineProperty = Object.defineProperty // ie9+

export const objectCreate = Object.create // ie9+

export const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor // ie9+

// export const setPrototypeOf = Object.setPrototypeOf // ie11+
export const setPrototypeOf = Object.setPrototypeOf || (function (obj, proto) {
  if (obj.__proto__) {
    obj.__proto__ = proto
    return obj
  }

  const F = function (this) {
    for (let key in obj) {
      defineProperty(this, key, {
        value: obj[key]
      })
    }
  }

  F.prototype = proto
  return new F()
})

/**
 * 定义一个属性
 * =================================================================
 */
export function def<T extends object>(obj: T, key: PropertyKey, val: any, enumerable?: boolean) {
  return defineProperty<T>(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * 定义属性的 getter and setter
 * =================================================================
 */
export function defAccessor<T extends object>(obj: T, key: PropertyKey, getter: Getter, setter: Setter) {
  return defineProperty<T>(obj, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  })
}

type Getter = () => any
type Setter = (v: any) => void
