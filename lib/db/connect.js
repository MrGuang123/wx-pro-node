const mongoose = require('mongoose')
const { url, user, password } = require('../../config').db

// 打开和关闭数据库
module.exports = {
  open() {
    return mongoose.connect(url, {
      user: user,
      pass: password,
      poolSize: 6
    })
  },
  close() {
    return mongoose.connection.close()
  }
}