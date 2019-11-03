const { getSession } = require('../lib/wx')
const { encodeErcode } = require('../lib/crypto')

module.exports = {
    async login(code) {
        const session = await getSession(code)

        if(session) {
            const { openid } = session
            return login(openid)
        }else {
            throw new Error('登录失败')
        }
    },
    async getErCode() {
        const code = encodeErcode()
        await add(code)
        setTimeout(() => {
            removeData(code)
        }, 30000)

        return code
    }
}