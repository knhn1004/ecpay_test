const crypto = require('crypto')

const generateCheckMacValue = (data, hashKey, hashIV) => {
  const keys = Object.keys(data).sort()
  let checkValue = ''
  for (const key of keys) {
    checkValue += `${key}=${data[key]}&`
  }
  checkValue = `HashKey=${hashKey}&${checkValue}HashIV=${hashIV}` // There is already an & in the end of checkValue
  checkValue = encodeURIComponent(checkValue).toLowerCase()
  checkValue = checkValue
    .replace(/%20/g, '+')
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+')

  checkValue = crypto.createHash('sha256').update(checkValue).digest('hex')
  checkValue = checkValue.toUpperCase()
  return checkValue
}

module.exports = { generateCheckMacValue }
