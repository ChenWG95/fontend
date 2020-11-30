const { combine, or, optional, atLeastOne } = require("./utils.js")

// .在正则中为匹配换行符外的任意字符，所以需要转义
const Dot = "\\."

const DecimalDigit = "[0-9]"
const DecimalDigits = atLeastOne(DecimalDigit)
const NonZeroDigit = "[1-9]"
const SignedInteger = combine("[+-]?", DecimalDigits)
const ExponentPart = combine("[eE]", SignedInteger)
const DecimalIntegerLiteral = or(
  "0",
  combine(NonZeroDigit, optional(DecimalDigits))
)
const DecimalLiteral = or(
  combine(
    DecimalIntegerLiteral,
    Dot,
    optional(DecimalDigits),
    optional(ExponentPart)
  ),
  combine(Dot, DecimalDigits, optional(ExponentPart)),
  combine(DecimalIntegerLiteral, optional(ExponentPart))
)

const BinaryDigit = "[01]"
const BinaryIntegerLiteral = combine("0[bB]", atLeastOne(BinaryDigit))

const OctalDigit = "[0-7]"
const OctalIntegerLiteral = combine("o[oO]", atLeastOne(OctalDigit))

const HexDigit = "[0-9a-fA-F]"
const HexIntegerLiteral = combine("o[xX]", atLeastOne(HexDigit))

const LegacyOctalIntegerLiteral = combine("0", atLeastOne(OctalDigit))

const NumericLiteral = or(
  DecimalLiteral,
  BinaryIntegerLiteral,
  OctalIntegerLiteral,
  HexIntegerLiteral,
  LegacyOctalIntegerLiteral
)

// console.log(NumericLiteral)
function isNumberLiteral(literal) {
  return /((((0|([1-9](([0-9])+)?))\.(([0-9])+)?(([eE]([+-]?([0-9])+)))?)|(\.([0-9])+(([eE]([+-]?([0-9])+)))?)|((0|([1-9](([0-9])+)?))(([eE]([+-]?([0-9])+)))?))|(0[bB]([01])+)|(o[oO]([0-7])+)|(o[xX]([0-9a-fA-F])+)|(0([0-7])+))/g.test(
    literal
  )
}

console.log(isNumberLiteral(12e21))
