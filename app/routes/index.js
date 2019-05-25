const Router = require('koa-router'),
    combineRouters =require('koa-combine-routers'),
    userRouter = require('../controllers/indexController'),
    walletRouter=require('../controllers/walletController'),
    {
        renderIndex,
        renderTest
    }=require('../controllers/indexRender');

const indexRouter = new Router();
indexRouter
    .get('/',renderIndex)
    .get('/test',renderTest)
        
const router=combineRouters (
    userRouter,
    indexRouter,
    walletRouter
)
module.exports = router;
