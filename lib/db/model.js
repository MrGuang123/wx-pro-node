const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    openId: {
        type: String,
        index: true,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    lashLogin: {
        type: Date
    },
    name: {
        type: String,
        index: true
    },
    avatar: {
        type: String
    },
    userType: {
        type: Number
    }
})

const codeSchema = new mongoose.Schema({
    code: {
        type: String
    },
    sessionKey: String
})

module.exports = {
    userSchema,
    codeSchema
}