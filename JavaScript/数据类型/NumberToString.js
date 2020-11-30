/**
 * Number转化为String
 *
 * 十进制数字 => 十进制字符串
 * 十进制数字 => 二进制字符串
 * 十进制数字 => 八进制字符串
 * 十进制数字 => 十六进制字符串
 *
 * Number.toString方法
 */
function convertNumberToString(number, radix) {
  let arr = []
  let fractional = number - Math.floor(number)
  let integer = Math.floor(number)

  /* 
  整数，/radix，取余
  逆序
  */
  while (integer >= radix) {
    code = integer % radix
    if (code > 9) {
      code = "a".codePointAt() + (code - 10)
      code = String.fromCharCode(code)
    }
    arr.unshift(code)
    integer = Math.floor(integer / radix)
  }

  if (integer) {
    arr.unshift(number)
  }

  if (fractional) {
    let maxRange = 20
    let fractionalArr = []
    /*
    进制，*radix，取整数部分，直至为整数，最多20位（防止无限循环）
    正序
     */
    while (!Number.isInteger(fractional) && maxRange) {
      let res = fractional * radix
      let integer = Math.floor(res)
      if (integer > 9) {
        integer = String.fromCharCode((10 - integer) + 'a'.codePointAt())
      }
      fractionalArr.push(integer)

      fractional = res - Math.floor(res)
      maxRange--
    }

    return arr.join("") + "." + fractionalArr.join("")
  }

  return arr.join("")
}

console.log(convertNumberToString(0.1, 16))
