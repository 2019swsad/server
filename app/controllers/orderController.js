const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth'),
    {getNow}=require('../helpers/date')


const orderDB = db.get('Order')

const orderRouter=new Router({prefix:'/order'})
orderRouter
    .post('/create',         check,  createOrder)
    .get('/all',             getAllOrder)
    .get('/cancel/:id',      check,  isSelfOp,   cancelOrder)


// Task schema
const orderSchema = Joi.object().keys({
    title:Joi.string().min(4).max(60).trim().required(),
    type:Joi.string().required(),
    salary:Joi.number().integer().min(1).required(),
    description:Joi.string(),
    beginTime:Joi.date().min('now').required(),
    expireTime:Joi.date().min(Joi.ref('beginTime')).required(),
    participantNum:Joi.number().integer().min(1).required(),
    tags:Joi.string()
});

/**
 * @example curl -XPOST "http://localhost:8081/order/create" -d '{uid:"xxx",tid:"xxx",}' -H 'Content-Type: application/json'
 * oid tid status uid createTime message price 
 */
async function createOrder(ctx,next) {
    // let passdata=await Joi.validate(ctx.request.body,orderSchema)
    let passdata=ctx.request.body
    passdata.oid=uuid()
    passdata.createTime=getNow()
}

/**
* @example curl -XGET "http://localhost:8081/order/all"
*/
async function getAllOrder (ctx, next) {
    ctx.body=await orderDB.find().then((docs)=>{return docs})
    await next();
}

/**
* @example curl -XGET "http://localhost:8081/task/cancel/:id"
* Todo : Money operations.
*/
async function cancelOrder(ctx, next) {
  await orderDB.remove({oid:ctx.params.id,uid:ctx.state.user[0].uid});
  ctx.status = 204;
  await next();
}

async function noticeNotFinish(tid){
    await orderDB.find({tid:tid},{status:'taskFin'},{multi:true})

}

module.exports={orderRouter,noticeNotFinish}