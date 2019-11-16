const { User } = require('./model')
const { encode, decode } = require('../crypto')

// 通过openID获取用户
const getByOpenId = async openId => {
  const users = User.find({
    openId: openId
  })

  return users[0] || null
}

module.exports = {
  // 登录
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
  // 通过sessionKey查找用户
  async findBySessionKey(sessionKey) {
    const { id, time } = decode(sessionKey)
    const limitTime = 1000 * 60 * 60 * 24 * 3
    if (Date.now() - time > limitTime) {
      return null
    }

    const users = await User.find({
      _id: id
    })

    return users[0] || null
  },
  // 更新用户
  async update(id, data) {
    return User.update({
      _id: id
    }, data)
  },
  // 改变用户类型
  async updateUserType(id, type) {
    return User.update({
      _id: id
    }, {
        userType: type
      })
  },
  // 获取admin用户
  async getAdmins() {
    return User.find({
      userType: 1
    })
  },
  // 判断是否是admin用户
  async isAdmin(id) {
    const user = await User.findById(id)
    return user.userType === 1
  },
  // 判断用户是否被锁住
  async isLocked(id) {
    const user = await User.findById(id)
    return user.userType === -1
  },
  // 查找指定类型的用户
  async getUsersByType(type, pageIndex = 1, pageSize = 10) {
    return User.find({
      userType: type
    }).skip((pageIndex - 1) * pageSize)
      .limit(pageSize)
  },
  // 获取指定类型用户的数量
  async getUsersCountByType(type) {
    return User.count({
      userType: type
    })
  },
  // 获取所有用户
  async getUsers(pageIndex, pageSize) {
    // skip：跳过的条数，limit：查询结果的最大条数
    return User.find().skip((pageIndex - 1) * pageSize).limit(pageSize)
  },
  // 获取所有用户数量
  async getUsersCount() {
    return User.count()
  }
}