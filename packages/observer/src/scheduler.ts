import { nextTick } from '@viewjs/shared'

import { Dep } from './dep'
import type { Watcher } from './watcher'

const queue: Array<Watcher> = []

let has: Partial<Record<number, true | null>> = {}
let waiting = false
let flushing = false
let index = 0

/**
 * 重置调度程序的状态
 */
function resetSchedulerState() {
  index = queue.length = 0
  has = {}
  waiting = flushing = false
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue() {
  flushing = true

  let watcher: Watcher, id: number

  queue.sort((a, b) => a.id - b.id)

  // 不缓存长度，因为当我们运行现有的观察者时
  // 可能会有更多的观察者被推入
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]

    id = watcher.id
    has[id] = null
    watcher.run()
  }

  resetSchedulerState()
}

/**
 * 将一个观察者推入观察者队列
 * 具有重复id的任务将被跳过，除非它在队列被刷新时被推送
 */
export function queueWatcher(watcher: Watcher) {
  const id = watcher.id
  if (has[id] != null) {
    return
  }

  if (watcher === Dep.target && watcher.noRecurse) {
    return
  }

  has[id] = true

  if (!flushing) {
    queue.push(watcher)

  } else {
    // 如果已经刷新，则根据其id拼接监视器
    // 如果已经超过了它的id，它将立即被运行
    let i = queue.length - 1

    while (i > index && queue[i].id > watcher.id) {
      i--;
    }

    queue.splice(i + 1, 0, watcher)
  }

  // queue the flush
  if (!waiting) {
    waiting = true
    nextTick(flushSchedulerQueue)
  }
}
