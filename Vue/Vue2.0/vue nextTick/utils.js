/** 判断是否为内置构造函数 */
export function isNative (Ctnr) {
  return typeof Ctnr === 'function' && /native code/.test(Ctnr.toString())
}

export function noop () {}

