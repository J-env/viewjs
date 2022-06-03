export const _toString = Object.prototype.toString

export const isExtensible = Object.isExtensible // ie9+

export const isFrozen = Object.isFrozen // ie9+

export function isObject(obj: any) {
  return obj !== null && typeof obj === 'object'
}

export function isPlainObject(obj: any) {
  return toRawType(obj) === 'Object'
}

export function isArray(obj: any) {
  return toRawType(obj) === 'Array'
}

export function isNumeric(s: any) {
  return !isArray(s) && !isNaN(s)
}

export function isInteger(obj: any) {
  return typeof obj === 'number' && (obj % 1 === 0)
}

export function isString(obj: any): obj is string {
  return typeof obj === 'string'
}

export function isFunction(obj: any): obj is Function {
  return typeof obj === 'function'
}

export function isNative(ctor: any) {
  return isFunction(ctor) && /native code/.test(ctor.toString())
}

export function isUndefined(obj: any): obj is (null | undefined) {
  return obj == null
}

/**
 * 检查 value是否为原始值
 */
export function isPrimitive(value: any) {
  const v = typeof value
  return v === 'string' || v === 'number' || v === 'boolean' || v === 'symbol'
}

/**
 * 获取 obj 的原始类型值
 * =================================================================
 */
export function toRawType(obj: any) {
  return _toString.call(obj).slice(8, -1)
}
