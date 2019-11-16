const { Photo } = require('./model')

module.exports = {
  // 新增图片
  async add(userId, url, albumId) {
    let _photo = await Photo.create({
      userId,
      url,
      albumId
    })

    return _photo
  },
  // 更新图片
  async update(id, photo) {
    return Photo.update({ _id: id }, photo)
  },
  // 审核图片
  async approve(id, state) {
    return Photo.update({
      _id: id
    }, {
        isApproved: state || true
      })
  },
  // 删除图片，软删除
  async delete(id) {
    return Photo.update({
      _id: id
    }, {
        isDelete: true
      })
  },
  // 获取指定用户相册下图片
  async getPhotos(userId, albumId, pageIndex, pageSize) {
    let result

    if (pageSize) {
      result = await Photo.find({
        userId,
        albumId,
        isApproved: true,
        isDelete: false
      }).skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    } else {
      result = await Photo.find({
        userId,
        albumId,
        isApproved: true,
        isDelete: false
      }).sort({
        'created': -1
      })
    }

    return result
  },
  // 获取图片数量
  async getPhotosCount(userId, albumId) {
    return Photo.count({
      userId,
      albumId,
      isApproved: true,
      isDelete: false
    })
  },
  // 获取相册下所有图片
  async getPhotosByAlbumId(albumId, pageIndex, pageSize) {
    let result

    if (pageSize) {
      result = await Photo.find({
        albumId,
        isApproved: true,
        isDelete: false
      }).skip((pageIndex - 1) * pageSize)
        .limit(pageSize)
    } else {
      result = await Photo.find({
        albumId,
        isApproved: true,
        isDelete: false
      }).sort({
        'updated': -1
      })
    }

    return result
  },
  async getPhotosByAlbumIdCount(albumId) {
    return Photo.count({
      albumId,
      isApproved: true,
      isDelete: false
    })
  },
  // 获取待审核的图片
  async getApprovingPhotos(pageIndex, pageSize) {
    return Photo.find({
      isApproved: null,
      isDelete: false
    }).skip((pageIndex - 1) * pageSize).limit(pageSize)
  },
  // 获取待审核图片数量
  async getApprovingPhotoCount() {
    return Photo.count({
      isApproved: null,
      isDelete: false
    })
  },
  // 获取所有图片
  async getAll(pageIndex, pageSize) {
    return Photo.find({
      isDelete: false
    })
  },
  // 获取所有图片数量
  async getAllCount() {
    return Photo.count({
      isDelete: false
    })
  },
  // 获取审核通过的图片
  async getApprovedPhotos(pageIndex, pageSize) {
    return Photo.find({
      isApproved: true,
      isDelete: false
    }).skip((pageIndex - 1) * pageSize)
      .limit(pageSize)
  },
  // 获取审核通过图片的数量
  async getApprovedPhotosCount() {
    return Photo.count({
      isApproved: true,
      isDelted: false
    })
  },
  // 获取审核未通过图片
  async getUnApprovedPhotos(pageIndex, pageSize) {
    return Photo.find({
      isApproved: false,
      isDelete: false
    }).skip((pageIndex - 1) * pageSize)
      .limit(pageSize)
  },
  // 获取审核未通过图片数量
  async getUnApprovedPhotosCount() {
    return Photo.count({
      isApproved: false,
      isDelete: false
    })
  },
  // 通过ID查找图片
  async getPhotoById(id) {
    return Photo.findById(id)
  },
}