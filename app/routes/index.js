const Router = require('koa-router'),
    KoaBody = require('koa-body'),
    {
        getId, 
        list, 
        registerUser, 
        updateUser, 
        removeUser,
        nameIsExist,
        loginUser
    } = require('../controllers/indexController'),
    {renderIndex}=require('../controllers/indexRender');

const router = new Router();

    router
        .get('/',               renderIndex)
        .get('/users',          list)
        .get('/users/:id',      getId)
        .get('/users/checkname/:name',   nameIsExist)
        .post('/users/reg/',    KoaBody(), registerUser)
        .post('/users/log/',    KoaBody(), loginUser)
        .put('/users/:id',      KoaBody(), updateUser)
        .delete('/users/:id',   removeUser);

module.exports = {
    routes () { return router.routes() },
    allowedMethods () { return router.allowedMethods() }
};
