const Router = require('koa-router'),
    combineRouters =require('koa-combine-routers'),
    userRouter = require('../controllers/userController'),
    {walletRouter}=require('../controllers/walletController'),
    taskRouter=require('../controllers/taskController'),
    {orderRouter}=require('../controllers/orderController')
    indexRouter=require('../controllers/indexRender');



const router=combineRouters (
    userRouter,
    indexRouter,
    walletRouter,
    taskRouter,
    orderRouter
)
module.exports = router;
