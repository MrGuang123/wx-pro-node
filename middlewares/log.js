const log4js = require('log4js')

const env = process.env.NODE_ENV

log4js.configure({
  // 配置日志记录器
  appenders: {
    // 文件记录方式
    everything: {
      type: 'file',
      filename: 'logs/pp.log',
      // 按照大小分割日志
      maxLogSize: 10485760,
      // 按照时间分割日志，间隔为天
      // filename: 'logs/task',
      // pattern: '-yyyy-MM-dd.log',
      // alwaysIncludePattern: true,
      // 保留3个备份文件
      backups: 3,
      // 压缩备份文件
      compress: true
    },
    dev: {
      // 开发时日志为console
      type: 'console'
    }
  },
  // 定义日志记录器类别
  categories: {
    default: {
      // 默认采用文件存储方式
      appenders: ['everything'],
      // 记录info级别以上的日志
      level: 'info'
    },
    dev: {
      // 开发使用文件存储和console
      appenders: ['dev', 'everything'],
      // 记录debug以上的级别的日志
      level: 'debug'
    }
  }
})

// 线上采用默认日志
let logger = log4js.getLogger()

// 开发环境使用dev的日志配置
if (env !== 'production') {
  logger = log4js.getLogger('dev')
}

module.exports = async function (ctx, next) {
  ctx.logger = logger

  // 默认记录每个请求的日志
  ctx.logger.info(JSON.stringify({
    url: ctx.url,
    query: ctx.query,
    headers: ctx.request.headers,
    ua: ctx.userAgent,
    time: Date.now()
  }))

  await next()
}