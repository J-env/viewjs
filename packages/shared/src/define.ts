export const defineProperty = Object.defineProperty // ie9+

export const objectCreate = Object.create // ie9+

export const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor // ie9+

// export const setPrototypeOf = Object.setPrototypeOf // ie11+
export const setPrototypeOf = Object.setPrototypeOf ||
  _def(Object, 'setPrototypeOf', function (obj: any, proto: object | null) {
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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#polyfill
export const objectIs = Object.is || _def(Object, 'is', function (x: any, y: any): boolean {
  // SameValue algorithm
  if (x === y) {
    // return true if x and y are not 0, OR
    // if x and y are both 0 of the same sign.
    // This checks for cases 1 and 2 above.
    return x !== 0 || 1 / x === 1 / y

  } else {
    // return true if both x AND y evaluate to NaN.
    // The only possibility for a variable to not be strictly equal to itself
    // is when that variable evaluates to NaN (example: Number.NaN, 0/0, NaN).
    // This checks for case 3.
    return x !== x && y !== y
  }
})

/**
 * _def
 * @param obj
 * @param key
 * @param val
 * @returns
 */
function _def(obj: any, key: PropertyKey, val: any) {
  def(obj, key, val)
  return val
}

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
