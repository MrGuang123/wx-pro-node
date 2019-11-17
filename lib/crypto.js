const crypto = require('crypto')

const key = 'ytg_2019_11'
const iv = 'addto'
const algorithm = 'aes-256-cbc'

// 使用node的crypto 进行加密和解密，对称加密
function encode(id) {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let idStr = [id, Date.now()].join('|')
  let str = cipher.update(idStr, 'utf8', 'hex')
  str += cipher.final('hex')
  return str
}

function decode(str) {
  const cipher = crypto.createDecipheriv(algorithm, key, iv)
  str = cipher.update(str, 'hex', 'utf8')
  str += cipher.final('utf8')
  const arr = str.split('|')
  return {
    id: arr[0],
    time: parseInt(arr[1])
  }
}

function encodeErcode() {
  return encode(Math.random())
}

module.exports = {
  encode,
  decode,
  encodeErcode
}