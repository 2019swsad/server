const http = require('http'),
    Koa = require('koa'),
    config = require('config'),
    err = require('./helpers/error'),
    views=require('koa-views'),
    session = require('koa-session'),
    bodyParser = require('koa-bodyparser'),
    passport = require('koa-passport'),
    CSRF = require('koa-csrf');

const router  = require('./routes');

app = new Koa();

app.keys=['hihihi']
     
app.use(err);
app.use(views('app/views/',{extension:'ejs'}))
app.use(session({}, app));
app.use(bodyParser())
// app.use(new CSRF({
//     invalidSessionSecretMessage: 'Invalid session secret',
//     invalidSessionSecretStatusCode: 403,
//     invalidTokenMessage: 'Invalid CSRF token',
//     invalidTokenStatusCode: 403
//   }))
app.use(passport.initialize())
app.use(passport.session())
app.use(router());
// app.use(function(ctx, next) {
//     if (ctx.isAuthenticated()) {
//       return next()
//     } else {
//       ctx.redirect('/')
//     }
//   })

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