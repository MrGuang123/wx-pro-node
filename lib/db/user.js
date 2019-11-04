const { User } = require('./model')
const { encode, decode } = require('../crypto')

module.exports = {
  async login(openId) {
    let user = await getByOpenId(openId)
    if (!user) {
      user = await User.create({
        openId: openId
      })
    }

    const id = user._id
    const sessionKey = encode(id)
    await User.upDate({
      _id: id
    }, {
        lastLogin: Date.now()
      })

    return {
      sessionKey
    }
  },
  async findBySessionKey(sessionKey) {
    const { id, time } = decode(sessionKey)
    const limitTime = 1000 * 60 * 60 * 24 * 3
    if (Date.now() - time > limitTime) {
      return null
    }

    const users = await User.find({
      _id: id
    })

    if (users.length) {
      return users[0]
    }

    return null
  },
  async getUsers(pageIndex, pageSize) {
    // skip：跳过的条数，limit：查询结果的最大条数
    return User.find().skip((pageIndex - 1) * pageSize).limit(pageSize)
  },
  async getUsersCount() {
    return User.count()
  },
  async updateUserType(id, type) {
    return User.update({
      _id: id
    }, {
        userType: type
      })
  }
}