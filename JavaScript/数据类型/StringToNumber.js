// 正则匹配
const isBinary = /^0[bB](\d+)/
const isOctonary = /^0[oO](\d+)/
const isHex = /^0[xX]((\d+))/
const isDecimal = /([+-]?)(\d+)(?:\.)(\d*)?([eE]?)([+-]?)(\d*)/

/**
 * String转化为Number
 * 
 * 科学计数字符串 => 十进制整数
 * 十进制字符串 => 十进制整数
 * 二进制字符串 => 十进制整数
 * 八进制字符串 => 十进制整数
 * 十六进制字符串 => 十进制整数
 *
 * parseInt方法
 * @param {*} str
 * @returns
 */
function converStringToNumber (str) {
  if (isBinary.test(str)) {
    return _convertBinary(str)
  } else if (isOctonary.test(str)) {
    return _convertOctonary(str)
  } else if (isHex.test(str)) {
    return _convertHex(str)
  } else if (isDecimal.test(str)) {
    return _convertDecimal(str)
  } else {
    throw new Error('请输入正确的数字')
  }
}

function _convertDecimal (str) {
  // 匹配10进制 '-12.12e-3'
  const reg = /([+-]?)(\d+)(?:\.)(\d*)?([eE]?)([+-]?)(\d*)/ // 不可以写g哦，否则会导致全局匹配，不会捕获分组
  const matchRes = str.match(reg)

  // 取出number各部分
  const sign = matchRes[1]
  const integer = matchRes[2]
  const decimal = matchRes[3]
  const e = matchRes[4]
  const eSign = matchRes[5]
  const eInteger = matchRes[6]

  // 处理整数部分
  let num = 0
  for (let i = 0; i < integer.length; i++) {
    num += integer[i] * (10 ** (integer.length - 1 - i))
  }

  // 处理小数部分
  for (let i = 0; i < decimal.length; i++) {
    num += decimal[i] * (10 ** (-1 - i))
  }

  // 处理科学计数法
  if (e) {
    let exponent = 0
    for (let i = 0; i < eInteger.length; i++) {
      exponent += eInteger[i] * (10 ** (eInteger.length - 1 - i))
    }

    if (eSign && eSign === '-') {
      exponent = -exponent
    }

    num = num * (10 ** exponent)
  }

  // 处理+-
  if (sign && sign === '-') {
    num = -num
  }

  // 处理精度问题
  return resolvePrecision(num)
}

function _convertBinary(str) {
  const integer = str.match(isBinary)[1]
  let num = 0

  for (let i = 0; i < integer.length; i++) {
    num += integer[i] * (2 ** (integer.length - i - 1))
  }

  return num
}

function _convertOctonary(str) {
  const integer = str.match(isOctonary)[1]
  let num = 0

  for (let i = 0; i < integer.length; i++) {
    num += integer[i] * (8 ** (integer.length - i - 1))
  }

  return num
}

function _convertHex(str) {
  const integer = str.match(isHex)[1]
  let num = 0

  for (let i = 0; i < integer.length; i++) {
    num += coverCharToNumber(integer[i]) * (16 ** (integer.length - i - 1))
  }

  return num
}

// 解决精度问题
function resolvePrecision(num) {
  num = num + ''
  const x = num.split('.')[1].length
  const res = Math.round(`${num}e${x}`)
  return +`${res}e${-x}`
}

// 解决字符转数字问题
const CODE_0_POINT = '0'.codePointAt()
const CODE_9_POINT = '9'.codePointAt()
const CODE_A_POINT = 'a'.codePointAt()
const CODE_F_POINT = 'f'.codePointAt()

function coverCharToNumber(str) {
  const code = str.toLowerCase().codePointAt()

  if (code >= CODE_0_POINT && code <= CODE_9_POINT) {
    return code - CODE_0_POINT
  }

  if (code >= CODE_A_POINT && code <= CODE_F_POINT) {
    return code - CODE_A_POINT + 10 // A代表10
  }
}

console.log(converStringToNumber('-12.12e-3'))
console.log(converStringToNumber('-12.12'))
console.log(converStringToNumber('0b111'))
console.log(converStringToNumber('0x111'))
console.log(converStringToNumber('0o111'))
