import { def, setPrototypeOf, objectCreate } from '@viewjs/shared'

import type { Observer } from './observe'
import { __ob__ } from './constants'

const arrayProto = Array.prototype
const arrayMethods = objectCreate(arrayProto)

/**
 * 将 arrayMethods 增加为目标数组的原型
 */
export function setProtoOfArray(arr: any[]) {
  setPrototypeOf(arr, arrayMethods)
}

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * 拦截变异的方法并发出事件
 */
for (let i = 0, l = methodsToPatch.length; i < l; i++) {
  const method = methodsToPatch[i]
  // cache original method
  const original = arrayProto[method]

  def(arrayMethods, method, function (this: any[], ...args) {
    const result = original.apply(this, args)
    const ob: Observer = this[__ob__]

    let inserted

    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break

      case 'splice':
        inserted = args.slice(2)
        break

      default:
        break
    }

    // 数组有新元素添加, 对新元素添加观测
    inserted && ob.observeArray(inserted)
    // 通知 watcher 更新
    ob.dep.notify()

    return result
  })
}

/**
 * 用一个新值交换给定索引处的元素
 * 并发出相应的事件
 */
def<any[]>(arrayProto, '$set', function (this: any[], index: number, value: any) {
  if (index >= this.length) {
    this.length = (+index) + 1
  }

  return this.splice(index, 1, value)[0]
})

/**
 * 方便的方法删除元素在给定的索引
 * 或目标元素引用
 */
def<any[]>(arrayProto, '$remove', function (this: any[], item: any): any[] | void {
  if (this.length) {
    const index = this.indexOf(item)

    if (index > -1) {
      return this.splice(index, 1)
    }
  }
})

declare global {
  interface Array<T> {
    $set(index: number, value: any): T[]
    $remove(item: any): T[] | void
  }
}
