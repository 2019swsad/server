const Router = require('koa-router'),
    combineRouters =require('koa-combine-routers'),
    {userRouter} = require('../controllers/userController'),
    walletRouter=require('../controllers/walletController'),
    taskRouter=require('../controllers/taskController'),
    orderRouter=require('../controllers/orderController'),
    indexRouter=require('../controllers/indexRender'),
    msgRouter=require('../controllers/msgController');



const router=combineRouters (
    userRouter,
    indexRouter,
    walletRouter,
    taskRouter,
    orderRouter,
    msgRouter
)
module.exports = router;
