const fs = require('fs'),
    path = require('path'),
    send=require('koa-send'),
    Router = require('koa-router'),
    { check } = require('../helpers/auth')

const fileRouter = new Router({ prefix: '/file' })
fileRouter
    .post('/', check, handleUpload)
    .get('/:id', handleFetch)

async function handleUpload(ctx, next) {
    console.log(ctx.request)
    const file = ctx.request.files.file
    const reader = fs.createReadStream(file.path)
    const stream = fs.createWriteStream(path.join('./upload/', ctx.state.user[0].uid+'.jpg'))
    reader.pipe(stream)
    ctx.status=200
    await next()
}
async function handleFetch(ctx, next) {
    await send(ctx,'./upload/'+ctx.params.id+'.jpg')
    await next()
}
module.exports = fileRouter