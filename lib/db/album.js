const { Album } = require('./model')

module.exports = {
  async add(userId, name) {
    return Album.create({
      userId,
      name
    })
  },
  async update(id, name) {
    return Album.update({
      _id: id
    }, {
        name: name
      })
  },
  async findById(id) {
    return Album.findById(id)
  },
  async delete(id) {
    return Album.deleteOne({
      _id: id
    })
  },
  async getAlbums(userId, pageIndex, pageSize) {
    return Album.find({
      userId
    }).sort({
      'updated': -1
    })
  }
}