const { appKey, appSecret } = require('../config')
const request = require('request')

let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appKey}&secret=${appSecret}`
module.exports = {
    async getSession(code) {
        url += `&js_code=${code}&grant_type=authorization_code`
        return new Promise((resolve, reject) => {
            request(url,{
                method: 'GET',
                json: true
            }, (err, res, body) => {
                if(err) {
                    reject(err)
                }else {
                    if(body.errcode) {
                        reject(new Error(body.errmsg))
                    }else {
                        resolve(body)
                    }
                }
            })
        })
    }
}