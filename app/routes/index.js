const Router = require('koa-router'),
    combineRouters =require('koa-combine-routers'),
    userRouter = require('../controllers/indexController'),
    walletRouter=require('../controllers/walletController'),
    taskRouter=require('../controllers/taskController'),
    indexRouter=require('../controllers/indexRender');



const router=combineRouters (
    userRouter,
    indexRouter,
    walletRouter,
    taskRouter
)
module.exports = router;
