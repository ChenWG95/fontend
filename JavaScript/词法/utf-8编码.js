function utf8Encode(str) {
  // utf8Arr
  utf8arr = []

  // 转化为码点
  const code = str.codePointAt()

  if (code <= 0x007f) {
    // length: 7
    // 0XXXX XXXX

    // 取7位
    let get7 = 0b1111111 & code
    // 写7位
    utf8arr.push(0b00000000 | get7)
  } else if (code >= 0x0080 && code <= 0x07ff) {
    // length: 5 + 6
    // 110X XXXX
    // 10XX XXXX

    // 取5位
    let get5 = 0b11111 & (code >> 6)
    utf8arr.push(0b11000000 | get5)
    // 取6位
    let get6 = 0b111111 & code
    utf8arr.push(0b10000000 | get6)
  } else if (code >= 0x0800 && code <= 0xffff) {
    // length: 4 + 6 + 6
    // 1110 XXXX
    // 10XX XXXX
    // 10XX XXXX

    // 取4位
    let get4 = 0b1111 & (code >> 12)
    utf8arr.push(0b11100000 | get4)
    // 取6位
    let get6 = 0b111111 & (code >> 6)
    utf8arr.push(0b10000000 | get6)
    // 取6位
    let get62 = 0b111111 & code
    utf8arr.push(0b10000000 | get62)
  }

  return utf8arr.join(",")
}

console.log(utf8Encode("美"))
