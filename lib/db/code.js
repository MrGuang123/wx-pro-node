const { Code } = require('./model')

// 处理session
module.exports = {
  async add(code) {
    return Code.create({
      code: code
    })
  },
  async updateSessionKey(code, sessionKey) {
    return Code.update({
      code: code
    }, {
        sessionKey: sessionKey
      })
  },
  async getSessionKey(code) {
    const data = Code.findOne({
      code: code
    })
    if (data) {
      return data.sessionKey
    } else {
      return null
    }
  },
  async removeData(code) {
    return Code.deleteMany({
      code: code
    })
  },
}