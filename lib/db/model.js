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

const albumSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    name: {
        type: String
    }
}, {
        // 禁用versionKey，在并发操作的时候容易发生数组越界问题
        versionKey: false,
        // 自动添加createdAt和updatedAt字段并且更名为created和updated
        timestamps: { createdAt: 'created', updatedAt: 'updated' }
    })

const photoSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    url: {
        type: String
    },
    isApproved: {
        type: Boolean,
        default: null,
        index: true
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId
    },
    created: {
        type: Date,
        default: Date.now
    },
    isDelete: {
        type: Boolean,
        default: false
    }
})

module.exports = {
    User: mongoose.model('User', userSchema),
    Code: mongoose.model('Code', codeSchema),
    Album: mongoose.model('Album', albumSchema),
    Photo: mongoose.model('Photo', photoSchema)
}