const http = require('http'),
    Koa = require('koa'),
    config = require('config'),
    err = require('./helpers/error'),
    {routes, allowedMethods}  = require('./routes'),
    views=require('koa-views'),
    session = require('koa-session');
    app = new Koa();



const CONFIG = {
    key: 'koa:main', /** (string) cookie key (default is koa:sess) */
    maxAge: 86400000,
    autoCommit: true, /** (boolean) automatically commit headers (default true) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    };
      
     
app.use(err);
app.use(views('app/views/',{extension:'ejs'}))
app.use(session(CONFIG, app));
app.use(routes());
app.use(allowedMethods());


const server = http.createServer(
    app.callback()).listen(config.server.port, function () {
        console.log(
            '%s listening at port %d', 
            config.app.name, config.server.port);
});

module.exports = {
    closeServer() {
        server.close();
    }
};