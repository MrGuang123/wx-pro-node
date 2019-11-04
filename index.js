const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

const path = require('path')
const uuid = require('uuid')


async function yet(ctx, next) {
  setTimeout(function () {
    console.log('yet1')
  }, 1000)
  await next()
  console.log('yet2')
}

router.get('/local', yet, async (ctx, next) => {
  setTimeout(function () {
    console.log('local1')
  }, 1000)
  await next()
  console.log('local2')
}, ok)
async function ok(ctx, next) {
  console.log('ok1')
  ctx.body = {
    status: 0,
    data: 'hello'
  }
  setTimeout(function () {
    console.log('ok2')
  }, 1000)
  await next()
  console.log('ok3')
}

console.log(uuid.v1() + path.extname(__dirname + 'package.json'))

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(4002)