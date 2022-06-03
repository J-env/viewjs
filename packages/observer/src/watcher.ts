import { noop, isObject, def, isFunction } from '@viewjs/shared'

import { __watchers__, __watcher__ } from './constants'
import { Dep, pushTarget, popTarget, DepTarget } from './dep'
import { parseExpression } from './expression'
import { queueWatcher } from './scheduler'
import { traverse } from './traverse'

export const _options: WatcherOptions = {
  deep: false,
  sync: false,
  lazy: false,
  immediate: false
}

export type WatchOptions = Partial<WatcherOptions>

export function createWatch(
  owner: WatcherOwner,
  expOrFn: WatcherExpOrFn,
  cb?: WatcherCallback,
  opts?: WatchOptions
): Function {
  opts = {
    ..._options,
    ...(opts || {})
  }

  const watcher = new Watcher(owner, expOrFn, cb, opts)

  if (opts.immediate && isFunction(cb)) {
    pushTarget()
    cb.call(owner, watcher.value, undefined)
    popTarget()
  }

  return function unwatch() {
    watcher.teardown()
  }
}

export function createComputed(owner: object, getter: Function): Function {
  const watcher = new Watcher(
    owner as WatcherOwner,
    (getter || noop) as WatcherExpOrFn,
    null,
    {
      ..._options,
      lazy: true
    }
  )

  return function computedGetter() {
    watcher.dirty && watcher.evaluate()
    Dep.target && watcher.depend()
    return watcher.value
  }
}

// ===================================================
// Watcher ===========================================
let uid = 0

export class Watcher implements DepTarget {
  owner: WatcherOwner
  id: number
  deep: boolean
  lazy: boolean
  sync: boolean
  dirty: boolean
  active: boolean

  deps: Dep[]
  newDeps: Dep[]
  depIds: DepIds
  newDepIds: DepIds

  getter: Function
  value: any
  cb?: WatcherCallback | null

  noRecurse?: boolean

  constructor(
    owner: WatcherOwner,
    expOrFn: WatcherExpOrFn,
    cb?: WatcherCallback | null,
    options?: WatcherOptions | null,
    isRenderWatcher?: boolean
  ) {
    // owner
    if (this.owner = owner) {
      owner[__watchers__].push(this)
      isRenderWatcher && def(owner, __watcher__, this)
    }

    // options
    if (options) {
      this.deep = !!options.deep
      this.sync = !!options.sync
      this.lazy = !!options.lazy

    } else {
      this.deep = this.sync = this.lazy = false
    }

    this.cb = cb
    this.id = ++uid
    this.active = true
    this.dirty = this.lazy

    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()

    // parse expression for getter
    this.getter = isFunction(expOrFn)
      ? expOrFn
      : parseExpression(expOrFn)

    this.value = this.lazy
      ? undefined
      : this.get()
  }

  get() {
    pushTarget(this)

    let value

    try {
      value = this.getter.call(this.owner, this.owner)

    } catch (e) {
      throw e

    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      this.deep && traverse(value)

      popTarget()
      this.cleanupDeps()
    }

    return value
  }

  cleanupDeps() {
    let i = this.deps.length

    while (i--) {
      const dep = this.deps[i];
      !this.newDepIds.has(dep.id) && dep.removeSub(this)
    }

    let tmp: DepIds | Dep[] = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()

    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  addDep(dep: Dep) {
    const id = dep.id

    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)

      !this.depIds.has(id) && dep.addSub(this)
    }
  }

  update() {
    if (this.lazy) {
      this.dirty = true

    } else if (this.sync) {
      this.run()

    } else {
      queueWatcher(this)
    }
  }

  run() {
    if (this.active) {
      const value = this.get()

      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may have mutated.
        isObject(value) || this.deep
      ) {
        // set new value
        const oldValue = this.value

        this.value = value
        this.cb && this.cb.call(this.owner, value, oldValue)
      }
    }
  }

  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  depend() {
    let i = this.deps.length

    while (i--) {
      this.deps[i].depend()
    }
  }

  // 拆卸
  teardown() {
    if (this.active) {
      let i = this.deps.length

      while (i--) {
        this.deps[i].removeSub(this)
      }

      this.active = false
      this.value = null

      // @ts-ignore
      this.owner = this.cb = null
    }
  }
}

export type WatcherExpOrFn = string | (() => any)

export type WatcherCallback = (value: any, oldValue?: any) => any

type DepIds = Set<number>

export interface WatcherOptions {
  deep?: boolean
  lazy?: boolean
  sync?: boolean

  immediate?: boolean // 立即调用
}

export interface WatcherOwner {
  [__watcher__]: Watcher
  [__watchers__]: Watcher[]
}
