const Router = require('koa-router'),
    combineRouters =require('koa-combine-routers'),
    userRouter = require('../controllers/indexController'),
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
    indexRouter
)
module.exports = router;
