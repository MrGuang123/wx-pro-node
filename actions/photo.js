const album = require('../lib/db/album')
const photo = require('../lib/db/photo')

module.exports = {
  async addAlbum(userId, name) {
    return album.add(userId, name)
  },
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
  async deleteAlbum(id) {
    const photos = await photo.getPhotosByAlbumIdCount(id)
    if (photos.length) {
      throw new Error('相册还有照片，不允许删除')
    }

    return album.delete(id)
  },
  async getAlbums(userId, pageIndex, pageSize) {
    const albums = await album.getAlbums(userId)
    return Promise.all(albums.map(async function (item) {
      const id = item._id
      let ps = await photo.getPhotosByAlbumId(id)

      return Object.assign({
        photoCounts: ps.length,
        poster: ps[0] ? ps[0].url : null
      }, item.toObject())
    }))
  },
  async getPhotoById(id) {
    return photo.getPhotoById(id)
  },
  async delete(id) {
    return photo.delete(id)
  },
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
  async approve(id, state) {
    return photo.approve(id, state)
  }
}