const { getSession } = require('../lib/wx')
const { encodeErcode, decode } = require('../lib/crypto')
const { updateSessionKey } = require('../lib/db/code')
const {
  getUsers,
  getUsersCount,
  updateUserType,
  login,
  update,
  getUsersByType,
  getUsersCountByType
} = require('../lib/db/user')

module.exports = {
  // 登录
  async login(code) {
    const session = await getSession(code)

    if (session) {
      const { openid } = session
      return login(openid)
    } else {
      throw new Error('登录失败')
    }
  },
  // 更新
  async update(id, data) {
    return update(id, data)
  },
  // 设置用户类型
  async setUserType(id, userType) {
    return updateUserType(id, userType)
  },
  // 通过类型获取用户，type:0=>普通用户,1=>admin,-1=>禁用用户
  async getUsersByType(type, pageIndex, pageSize) {
    let count, users
    const types = [0, 1, -1]

    if (!types.includes(Number(type))) {
      [count, users] = Promise.all([getUsersCountByType(type), getUsersByType(type, pageIndex, pageSize)])
    } else {
      [count, users] = Promise.all([getUsersCount(), getUsers(pageIndex, pageSize)])
    }

    return {
      count,
      data: users
    }
  },
  // 获取二维码
  async getErCode() {
    const code = encodeErcode()

    await add(code)

    setTimeout(() => {
      removeData(code)
    }, 30000)

    return code
  },
  // 设置sessionKey
  async setSessionKeyForCode(code, sessionKey) {
    const { time } = decode(code)

    if (Date.now() - time > 30000) {
      throw new Error('time out')
    }

    await updateSessionKey(code, sessionKey)
  },
  // 获取sessionKey
  async getSessionKeyByCode(code) {
    const sessionKey = await getSessionKey(code)
    if (sessionKey) {
      await removeData(code)
    }

    return sessionKey
  }
}