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
