const hasOwnProperty = Object.prototype.hasOwnProperty

export function hasOwn(obj: object, key: PropertyKey): key is keyof typeof obj {
  return hasOwnProperty.call(obj, key)
}

export function remove<T = any>(arr: T[], item: T): T[] | void {
  if (arr.length) {
    const index = arr.indexOf(item)

    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Iterate object
 */
export function eachObject<T extends object>(obj: T, callback: (key: keyof T, val: T[keyof T]) => void) {
  if (!obj) return

  const keys = Object.keys(obj)
  let k, l = keys.length

  for (let i = 0; i < l; i++) {
    k = keys[i];
    callback(k, obj[k]);
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#polyfill
export function hasChanged(x: unknown, y: unknown): boolean {
  if (x === y) {
    return x === 0 && 1 / x !== 1 / (y as number)

  } else {
    return x === x && y === y
  }
}

