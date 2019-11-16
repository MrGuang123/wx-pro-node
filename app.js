const Koa = require('koa')
const BodyParser = require('koa-bodyparser')
const Static = require('koa-static')
const Cors = require('@koa/cors')

const path = require('path')

const router = require('./routes')
const logger = require('./middlewares/log')
const { open } = require('./lib/db/connect')

const app = new Koa()

// 链接数据库
open()

// 启动日志
app.use(logger)

// 设置cors跨域
app.use(cors({
  origin: '*'
}))

// 解析请求体,multipart:是否支持multiple表单
app.use(BodyParser({ multipart: true }))

// 设置静态资源
app.use(Static(path.resolve(__dirname, './uploads'), {
  maxage: 365 * 24 * 60 * 60 * 1000
}))

// 设置mime类型为json
app.use(async (ctx, next) => {
  ctx.type = 'application/json'
  await next()
})

// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.logger.error(error.stack || error)
    ctx.body = {
      status: -1,
      message: error.stack || error,
      code: error.status
    }
  }
})

// 路由处理
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(7521)
console.log('app run in port 7521')