const { Photo } = require('./model')

module.exports = {
  async getPhotosByAlbumIdCount(albumId) {
    return Photo.count({
      albumId,
      isApproved: true,
      isDelete: false
    })
  },
  async getPhotosByAlbumId(albumId, pageIndex, pageSize) {
    // TODO: 分页还未处理
    return await Photo.find({
      albumId,
      isApproved: true,
      isDelete: false
    }).sort({
      'updated': -1
    })
  },
  async getPhotoById(id) {
    return Photo.findById(id)
  },
  async delete(id) {
    return Photo.update({
      _id: id
    }, {
        isDelete: true
      })
  },
  async getApprovingPhotos(pageIndex, pageSize) {
    return Photo.find({
      isApproved: null,
      isDelete: false
    }).skip((pageIndex - 1) * pageSize).limit(pageSize)
  },
  async getApprovingPhotoCount() {
    return Photo.count({
      isApproved: null,
      isDelete: false
    })
  },
  async approve(id, state) {
    return Photo.update({
      _id: id
    }, {
        isApproved: state || true
      })
  }
}