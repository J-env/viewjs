import { isArray, isObject, isFrozen } from '@viewjs/shared'

import { __ob__ } from './constants'

const seenObjects = new Set()

/**
 * 递归地遍历一个Object 以唤起所有转换的getter
 * 这样Object内部的每个嵌套属性都被收集为一个“深”依赖项
 */
export function traverse(val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
  return val
}

function _traverse(val: any, seen: typeof seenObjects) {
  let i: number, keys: string[]

  const isA = isArray(val)

  if ((!isA && !isObject(val)) || isFrozen(val)) {
    return
  }

  if (val[__ob__]) {
    const depId = val[__ob__].dep.id

    if (seen.has(depId)) {
      return
    }

    seen.add(depId)
  }

  if (isA) {
    i = val.length

    while (i--) {
      _traverse(val[i], seen)
    }

  } else {
    keys = val ? Object.keys(val) : []
    i = keys.length

    while (i--) {
      _traverse(val[keys[i]], seen)
    }
  }
}
