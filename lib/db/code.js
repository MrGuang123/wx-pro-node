const { Code } = require('./model')

module.exports = {
    async add(code) {
        return Code.create({
            code: code
        })
    },
    async removeData(code) {
        return Code.deleteMany({
            code: code
        })
    }
}