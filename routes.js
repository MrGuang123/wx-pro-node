const Router = require('koa-router')
const router = new Router()
const multer = require('koa-multer')

const path = require('path')
// 下载request包会带uuid包
const uuid = require('uuid')

const account = require('./actions/account')
const photo = require('./actions/photo')
const auth = require('./middlewares/auth')


const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, uuid.v4() + ext)
  }
})
const uploader = multer({
  storage: storage
})


async function responseOK(context, next) {
  ctx.body = {
    status: 0
  }
  await next()
}

// 获取分页参数
function getPageParams(ctx) {
  return {
    pageIndex: parseInt(ctx.query.pageIndex) || 1,
    pageSize: parseInt(ctx.query.pageSize) || 10
  }
}

/**
 * 小程序接口部分
 */

// 小程序登录，接受小程序登录的code
router.get('/login', async ctx => {
  const code = ctx.query.code

  ctx.logger.info(`[login]用户登录Code为${code}`)

  ctx.body = {
    status: 0,
    data: await account.login(code)
  }
})

// 修改用户信息
router.put('/user', auth, async ctx => {
  context.logger.info(`[user]修改用户信息，用户ID为${ctx.state.user.id}，修改的内容为${ctx.request.body}`)

  await account.update(ctx.state.user.id, ctx.request.body)
  await next()
}, responseOK)

// 获取当前登录的用户信息
router.get('/self-info', auth, async ctx => {
  ctx.body = {
    status: 0,
    data: ctx.state.user
  }
})

// 获取二维码字符串
router.get('/login/ercode', async (ctx, next) => {
  ctx.logger.debug(`[login]生成登录二维码`)
  context.body = {
    status: 0,
    data: await account.getErCode()
  }
})

// 扫码登录中，小程序调用的接口，将扫到的二维码信息传递过来
router.get('/login/ercode/:code', auth, async (context, next) => {
  const code = context.params.code
  const sessionKey = context.get('x-session')
  await account.setSessionKeyForCode(code, sessionKey)
  await next()
}, responseOK)

// 轮询检查登录状态
router.get('/login/ercode/check/:code', async (ctx, next) => {
  const startTime = Date.now()
  async function login() {
    const code = ctx.params.code
    const sessionKey = await account.getSessionKeyByCode(code)

    if (sessionKey) {
      context.body = {
        status: 0,
        data: {
          sessionKey: sessionKey
        }
      }
    } else {
      if (Date.now() - startTime < 10000) {
        await new Promise(resolve => {
          process.nextTick(() => {
            resolve()
          })
        })
        await login()
      } else {
        context.body = {
          status: -1
        }
      }
    }
  }
  await login()
})

// 获取相册列表
router.get('/albums', auth, async ctx => {
  const pageParams = getPageParams(ctx)
  const albums = await photo.getAlbums(ctx.state.user.id, pageParams.pageIndex, pageParams.pageSize)

  ctx.body = {
    status: 0,
    data: albums
  }
})

// 小程序获取相册列表
router.get('xcx/album', auth, async (ctx, next) => {
  const albums = await photo.getAlbums(ctx.state.user.id)

  ctx.body = {
    status: 0,
    data: albums
  }
}, responseOK)

// 获取某个相册的照片列表
router.get('/album/:id', auth, async ctx => {
  const pageParams = getPageParams(ctx)
  const photos = photo.getPhotos(ctx.state.user.id, ctx.params.id, pageParams.pageIndex, pageParams.pageSixe)

  ctx.body = {
    status: 0,
    data: photos
  }
})

// 小程序获取某个相册的照片列表
router.get('/xcx/album/:id', auth, async ctx => {
  const photos = photo.getPhotos(ctx.state.user.id, ctx.params.id)

  ctx.body = {
    status: 0,
    data: photos
  }
})

// 添加相册
router.post('/album', auth, async (ctx, next) => {
  const { name } = ctx.request.body
  await photo.addAlbum(ctx.state.user.id, name)
  await next()
}, responseOK)

// 修改相册
router.put('/album/:id', auth, async (ctx, next) => {
  await photo.updateAlbum(ctx.params.id, ctx.body.name, ctx.user)
  await next()
}, responseOK)

// 删除相册
router.del('album/:id', auth, async (ctx, next) => {
  await photo.deleteAlbum(ctx.params.id)
  await next()
}, responseOK)

// 上传照片
router.post('/photo', auth, uploader.single('file'), async (ctx, next) => {
  const { file } = ctx.req
  const { id } = ctx.req.body
  const url = 'baseUrl' + file.filename

  await photo.add(ctx.state.user.id, url)
  await next()
}, responseOK)

// 删除照片
router.del('/photo/:id', auth, async (ctx, next) => {
  const p = await photo.getPhotoById(ctx.params.id)
  if (p) {
    if (p.userId === ctx.state.user.id || ctx.state.user.isAdmin) {
      await photo.delete(context.params.id)
    } else {
      ctx.throw(403, '该用户无权限')
    }
  }

  await next()
})


/**
 * 管理后台接口
 */

// 获取不同类型照片,pending:待审核，accepted：已审核，rejected：未通过，all或者其他为所有
router.get('/admin/photo/:type', auth, async (ctx, next) => {
  const params = getPageParams(ctx)
  const photos = await photo.getPhotosByType(ctx.params.type, params.pageIndex, params.pageSize)

  context.body = {
    status: 0,
    data: photos
  }
})

// 修改照片信息
router.put('/admin/photo/:id', auth, async (ctx, next) => {
  if (ctx.state.user.isAdmin) {
    await photo.updatePhoto(ctx.params.id, ctx.request.body)
  } else {
    ctx.throw(403, '该用户无权限修改图片')
  }

  await next()
}, responseOK)

// 获取用户列表
router.get('/admin/user/:type', async (ctx, next) => {
  const pageParams = getPageParams(ctx)
  const typeMap = {
    admin: 1,
    blocked: -1,
    ordinary: 0
  }

  ctx.body = {
    status: 0,
    data: await account.getUsersByType(typeMap[ctx.params.type], pageParams.pageIndex, pageParams.pageSize)
  }

  await next()
})

// 修改用户类型,admin:管理员，blocked：禁用用户，ordinary：普通用户
router.get('/admin/user/:id', async (ctx, next) => {
  ctx.body = {
    status: 0,
    data: await account.update(ctx.params.id, ctx.request.body)
  }

  await next()
})


// 修改照片的状态
// router.put('/admin/photo/approve/:id/:state', auth, async (ctx, next) => {
//   await photo.approve(ctx.params.id, ctx.params.type)
//   await next()
// }, responseOK)

module.exports = router