let uid = 0

export interface DepTarget {
  id: number
  addDep(dep: Dep): void
  update(): void
}

export class Dep {
  static target?: DepTarget | null = null

  id: number
  subs: Array<DepTarget>

  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub: DepTarget) {
    this.subs.push(sub)
  }

  removeSub(sub: DepTarget) {
    this.subs.$remove(sub)
  }

  depend() {
    Dep.target && Dep.target.addDep(this)
  }

  notify() {
    // 拷贝一份收集的 Watcher
    const subs = this.subs.slice()
    const len = subs.length

    for (let i = 0; i < len; i++) {
      subs[i].update()
    }
  }
}

const targetStack: Array<DepTarget | null | undefined> = []

export function pushTarget(target?: DepTarget | null) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
