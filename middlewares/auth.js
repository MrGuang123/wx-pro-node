

module.exports = async function (context, next) {
    const sessionKey = context.get('x-session')
    if (!sessionKey) {
        context.throw(401, '请求头中未包含x-session')
    }

    const user = await findBySessionKey(sessionKey)
    if (user) {
        context.state.user = {
            id: user._id,
            name: user.name,
            avatar: user.avatar,
            isAdmin: user.userType === 1
        }
    } else {
        context.throw(401, 'session过期')
    }

    if (/^\/admin/i.test(context.url) && !context.state.user.isAdmin) {
        context.throw(401, '当前资源仅支持管理员访问')
    }

    await next()
}