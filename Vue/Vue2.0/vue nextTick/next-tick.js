const { isNative } = require("./utils")

/** 是否使用微服务 */
let isUsingMicroTask = false

const callbacks = []
let pending = false

/**
 * 执行清空数组
 */
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0

  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let timerFunc

/** 根据环境支持程度timerFunc */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()

  timerFunc = () => {
    p.then(flushCallbacks)

    /** ios UIWebview的一些怪异行为导致Promise.then不能彻底结束，所以此处强加一波宏服务处理 */
    if (isIOS) setTimeout(noop)
  }

  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // 在不支持Promise的时候使用MutationObserver
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver在IE11上不可靠)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })

  timerFunc = () => {
    counter = (counter + 1) % 2 // 0 1
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate
  // 过长异步操作处理
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

/** nextTick本身 */
export function nextTick (cb, ctx) {
  let _resolve

  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (error) {
        handleError(e, ctx, 'nextTick')
      }
    }
  })

  if (!pending) {
    pending = true
    timerFunc()
  }

  if (!cb && typeof Promise !== 'undefined' && isNative(Promise)) {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
