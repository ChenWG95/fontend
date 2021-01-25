const mutableHandlers = {
  set: createSetter(),
  get: createGetter()
}
const proxyMap = new WeakMap()
const targetMap = new WeakMap()

function createGetter() {
  return function(target, k, receiver) {
      // 收集依赖
      track(target, 'get', k)
      // 输出读取值
      return Reflect.get(target, k, receiver)
  }
}

function createSetter() {
  return function(target, k, v, receiver) {
      const oldVal = target[k]
      // 设置属性
      Reflect.set(target, k, v, receiver)
      // 根据之前的proxy是否存在属性判断ADD/SET触发副作用
      const hasKey = Object.prototype.hasOwnProperty(target, k)
      
      if (!hasKey) {
          trigger(target, 'add', k, v)
      } else {
          trigger(target, 'set', k, v, oldVal)
      }
  }
}

function track(target, type, k, v) {
  // 寻找对应的依赖，没有则创建
  let depsMap = targetMap.get(target)
  if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(k)
  if (!dep) {
      depsMap.set(k, (dep = new Set()))
  }

  // 收集对应的副作用函数，track的时候要先把activeEffect设置为当前key的副作用函数
  if (!dep.has(activeEffect)) {
      dep.add(activeEffect)
      activeEffect.deps.push(dep)
  }
}

const targetMap = new WeakMap()

function trigger(target, type, k, v, oldVal) {
  // 获取target的depsMap
  const depsMap = targetMap.get(target)

  if (!depsMap) {
    return
  }

  const effects = new Set()

  // 添加副作用数组并去重
  function add (effectsToAdd) {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        effects.add(effect)
      })
    }
  }

  // 调度执行副作用函数
  function run (effect) {
    if (effect.options.scheduler) { // 调度执行
      effect.options.scheduler(effect)
    } else { // 直接执行
      effect()
    }
  }

  // 如果key不等于undefined，找到对应的effect添加副作用
  if (k !== void 0) {
    add(depsMap.get(k))
  }

  // 遍历执行副作用函数
  effects.forEach(run)
}

function reactive(target) {
  return createReactiveObject(target, mutableHandlers);
}

function createReactiveObject(target, mutableHandlers) {
  // mutableHandlers中创建 get & set 收集依赖
  let proxy = new Proxy(target, mutableHandlers)
  // 收集target对应的proxy
  proxyMap.set(target, proxy)
  return proxy
}
