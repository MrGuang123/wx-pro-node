const { Album } = require('./model')

module.exports = {
  // 添加相册
  async add(userId, name) {
    return Album.create({
      userId,
      name
    })
  },
  // 更新相册
  async update(id, name) {
    return Album.update({
      _id: id
    }, {
        name: name
      })
  },
  // 根据ID查找相册
  async findById(id) {
    return Album.findById(id)
  },
  // 删除相册
  async delete(id) {
    return Album.deleteOne({
      _id: id
    })
  },
  // 获取相册列表
  async getAlbums(userId, pageIndex, pageSize) {
    let result

    if (pageSize) {
      result = await Album.find({ userId })
        .skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    } else {
      result = await Album.find({ userId })
        .sort({ 'updated': -1 })
    }

    return result
  },
  // 获取相册数量
  getAlbumsCount(userId) {
    return Album.count({ userId })
  }
}