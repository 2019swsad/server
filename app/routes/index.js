const Router = require('koa-router'),
    KoaBody = require('koa-body'),
    {getId, list, registerUser, updateUser, removeUser} = require('../controllers/indexController');

const router = new Router();

    router
        .get('/users',        list)
        .get('/users/:id',    getId)
        .post('/users/',      KoaBody(), registerUser)
        .put('/users/:id',    KoaBody(), updateUser)
        .delete('/users/:id', removeUser);

module.exports = {
    routes () { return router.routes() },
    allowedMethods () { return router.allowedMethods() }
};
