const { getSession } = require('../lib/wx')
const { encodeErcode } = require('../lib/crypto')
const { updateSessionKey } = require('../lib/db/code')
const { getUsers, getUsersCount, updateUserType } = require('../lib/db/user')

module.exports = {
  async login(code) {
    const session = await getSession(code)

    if (session) {
      const { openid } = session
      return login(openid)
    } else {
      throw new Error('登录失败')
    }
  },
  async getErCode() {
    const code = encodeErcode()
    await add(code)
    setTimeout(() => {
      removeData(code)
    }, 30000)

    return code
  },
  async setSessionKeyForCode(code, sessionKey) {
    const { time } = decode(code)

    if (Date.now() - time > 30000) {
      throw new Error('time out')
    }

    await updateSessionKey(code, sessionKey)
  },
  async getSessionKeyByCode(code) {
    const sessionKey = await getSessionKey(code)
    if (sessionKey) {
      await removeData(code)
    }

    return sessionKey
  },
  async getUsers(pageIndex, pageSize) {
    const [count, users] = Promise.all([getUsersCount(), getUsers(pageIndex, pageSize)])
    return {
      count,
      data: users
    }
  },
  async setUserType(id, userType) {
    return updateUserType(id, userTYpe)
  }
}