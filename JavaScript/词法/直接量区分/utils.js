function combine (...args) {
  return `(${args.join('')})`
}

function or (...args) {
  return `(${args.join('|')})`
}

function optional (str) {
  return `(${str})?`
}

function atLeastOne (str) {
  return `(${str})+`
}

module.exports = {
  combine,
  or,
  optional,
  atLeastOne
}