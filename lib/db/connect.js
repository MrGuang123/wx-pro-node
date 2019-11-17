const mongoose = require('mongoose')
const { url, user, password } = require('../../config').db

const db = mongoose.connection
db.on('error', err => {
  console.error(err)
})
db.on('open', () => {
  console.log('connection success！')
})

// 打开和关闭数据库
module.exports = {
  open() {
    return mongoose.connect(url, {
      user: user,
      pass: password,
      poolSize: 6,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
  },
  close() {
    return mongoose.connection.close()
  }
}