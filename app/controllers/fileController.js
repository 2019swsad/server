const fs = require('fs'),
    path = require('path'),
    send = require('koa-send'),
    Router = require('koa-router'),
    { check } = require('../helpers/auth'),
    compress_img = require('compress-images')

const fileRouter = new Router({ prefix: '/file' })
fileRouter
    .post('/', check, handleUpload)
    .get('/:id', handleFetch)

async function handleUpload(ctx, next) {
    const file = ctx.request.files.file
    console.log(file);
    let aftername=file.type.replace(/\w+\//, '.');
    const reader = fs.createReadStream(file.path)
    const stream = fs.createWriteStream(path.join('./upload/', ctx.state.user[0].uid + aftername))
    reader.pipe(stream)
    //compress
    sleep(50)
    pathToImg = './upload/' + ctx.state.user[0].uid + aftername
    compress_img(pathToImg, './imgtest/', { compress_force: false, statistic: true, autoupdate: true }, false,
        { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
        { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
        { svg: { engine: 'svgo', command: '--multipass' } },
        { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } },
        (err, completed, statistic) => {
            console.log('-------------');
            console.log(err);
            console.log(completed);
            console.log(statistic);
            console.log('-------------');
        })
    ctx.status = 200
    await next()
}
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
async function handleFetch(ctx, next) {
    ctx.cacheControl('max-age=3600')
    if (fs.existsSync('./upload/' + ctx.params.id + '.jpg')) {
        await send(ctx, './upload/' + ctx.params.id + '.jpg')
    } else {
        await send(ctx, './upload/normal.jpg')
    }
    await next()
}
module.exports = fileRouter