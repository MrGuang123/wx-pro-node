const Router = require('koa-router')
const router = new Router()

// 获取二维码字符串
router.get('/login/ercode', async (context, next) => {
    context.body = {
        status: 0,
        data: await account.getErCode()
    }
})