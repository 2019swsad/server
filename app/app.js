const http = require('http'),
    Koa = require('koa'),
    config = require('config'),
    err = require('./helpers/error'),
    views=require('koa-views'),
    session = require('koa-session'),
    bodyParser = require('koa-bodyparser'),
    passport = require('koa-passport');

const {routes, allowedMethods}  = require('./routes');

app = new Koa();

      
     
app.use(err);
app.use(views('app/views/',{extension:'ejs'}))
app.use(session({}, app));
app.use(bodyParser())
app.use(passport.initialize())
app.use(passport.session())
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