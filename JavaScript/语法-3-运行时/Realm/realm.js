var objects = [
  eval,
  isFinite,
  isNaN,
  parseFloat,
  parseInt,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  Array,
  Date,
  RegExp,
  Promise,
  Proxy,
  Map,
  WeakMap,
  Set,
  WeakSet,
  Function,
  Boolean,
  String,
  Number,
  Symbol,
  Object,
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  ArrayBuffer,
  SharedArrayBuffer,
  DataView,
  Float32Array,
  Float64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Uint8Array,
  Uint16Array,
  Uint32Array,
  Uint8ClampedArray,
  Atomics,
  JSON,
  Math,
  Reflect,
]
var set = new Set()

objects.forEach((obj) => {
  !set.has(obj) && set.add(obj)
})

function getAllProperties(obj) {
  const properties = Object.getOwnPropertyNames(obj)

  for (let property of properties) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, property)
    ;[
      // 获取get，set，value
      "value",
      "set",
      "get",
    ].map((v) => {
      if (descriptor[v] && !set.has(descriptor[v])) {
        set.add(descriptor[v])
      }
    })
  }
}

getAllProperties(objects)
console.log(set)
