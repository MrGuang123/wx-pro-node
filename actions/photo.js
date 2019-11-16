const album = require('../lib/db/album')
const photo = require('../lib/db/photo')

module.exports = {
  // 获取图片
  async getPhotos(userId, albumId, pageIndex, pageSize) {
    const [count, photos] = Promise.all([
      photo.getPhotosCount(userId, albumId),
      photo.getPhotos(userId, albumId, pageIndex, pageSize)
    ])

    return {
      count,
      data: photos
    }
  },
  // 获取待审核照片
  async getApprovingPhotos(pageIndex, pageSize) {
    const [count, photos] = Promise.all([
      photo.getApprovingPhotosCount(),
      photo.getApprovingPhotos(pageIndex, pageSize)
    ])

    return {
      count,
      data: photos
    }
  },
  // 获取指定类型的图片
  async getPhotosByType(type, pageIndex, pageSize) {
    let count, photos
    switch (type) {
      case 'pending':
        [count, photos] = await Promise.all([photo.getApprovingPhotosCount(), photo.getApprovingPhotos(pageIndex, pageSize)])
        break
      case 'accepted':
        [count, photos] = await Promise.all([photo.getApprovedPhotosCount(), photo.getApprovedPhotos(pageIndex, pageSize)])
        break
      case 'rejected':
        [count, photos] = await Promise.all([photo.getUnApprovedPhotosCount(), photo.getUnApprovedPhotos(pageIndex, pageSize)])
        break
      default:
        [count, photos] = await Promise.all([photo.getAllCount(), photo.getAll(pageIndex, pageSize)])
    }
    return {
      count,
      data: photos
    }
  },
  // 审核图片
  async approve(id, state) {
    return photo.approve(id, state)
  },
  // 更新图片
  async updatePhoto(id, data) {
    return photo.update(id, data)
  },
  // 删除图片
  async delete(id) {
    return photo.delete(id)
  },
  // 添加图片
  async add(userId, url, albumId) {
    return photo.add(userId, url, albumId)
  },
  // 通过ID获取图片
  async getPhotoById(id) {
    return photo.getPhotoById(id)
  },
  // 获取相册
  async getAlbums(userId, pageIndex, pageSize) {
    let albums, count

    if (pageSize) {
      [count, albums] = await Promise.all([
        album.getAlbumsCount(id),
        album.getAlbums(id, pageIndex, pageSize)
      ])
    } else {
      albums = await album.getAlbums(id)
    }

    let result = await Promise.all(albums.map(async function (item) {
      const id = item._id
      let ps = await photo.getPhotosByAlbumId(id)

      return Object.assign({
        photoCounts: ps.length,
        poster: ps[0] ? ps[0].url : null
      }, item.toObject())
    }))

    return Object.assign(count ? { count } : {}, { data: result })
  },
  // 添加相册
  async addAlbum(userId, name) {
    return album.add(userId, name)
  },
  // 更新相册
  async updateAlbum(id, name, user) {
    const _album = await album.findById(id)
    if (!_album) {
      throw new Error('修改的相册不存在')
    }

    if (!user.isAdmin && user.id !== _album.userId) {
      throw new Error('你没有修改权限')
    }

    return album.update(id, name)
  },
  // 删除相册
  async deleteAlbum(id) {
    const photos = await photo.getPhotosByAlbumIdCount(id)
    if (photos.length) {
      throw new Error('相册还有照片，不允许删除')
    }

    return album.delete(id)
  }
}