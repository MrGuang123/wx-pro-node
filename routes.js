const Router = require('koa-router')
const router = new Router()
const multer = require('koa-multer')

const path = require('path')
// 下载request包会带uuid包
const uuid = require('uuid')

const account = require('./actions/account')
const auth = require('./middlewares/auth')
const photo = require('./actions/photo')


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

// 获取二维码字符串
router.get('/login/ercode', async (context, next) => {
  context.body = {
    status: 0,
    data: await account.getErCode()
  }
})

router.get('/login/ercode/:code', auth, async (context, next) => {
  const code = context.params.code
  const sessionKey = context.get('x-session')
  await account.setSessionKeyForCode(code, sessionKey)
  await next()
}, responseOK)

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

// 获取相册列表
router.get('xcx/album', auth, async (ctx, next) => {
  const albums = await photo.getAlbums(ctx.state.user.id)
  ctx.body = {
    status: 0,
    data: albums
  }
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
// 获取用户列表
router.get('/admin/user', async (ctx, next) => {
  const pageParams = getPageParams(ctx)

  ctx.body = {
    status: 0,
    data: await account.getUsers(pageParams.pageIndex, pageParams.pageSize)
  }

  await next()
})

// 修改用户类型
router.get('/admin/user/:id/userType/:type', async (ctx, next) => {
  const body = {
    status: 0,
    data: await account.setUserType(ctx.params.id, ctx.params.type)
  }

  ctx.body = body

  await next()
})

// 获取不同类型照片
router.get('/admin/photo/:type', auth, async (ctx, next) => {
  const params = getPageParams(ctx)
  const photos = await photo.getPhotosByType(ctx.params.type, params.pageIndex, params.pageSize)

  context.body = {
    status: 0,
    data: photos
  }
})

// 修改照片的状态
router.put('/admin/photo/approve/:id/:state', auth, async (ctx, next) => {
  await photo.approve(ctx.params.id, ctx.params.type)
  await next()
}, responseOK)