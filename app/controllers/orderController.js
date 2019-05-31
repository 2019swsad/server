const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth'),
    {getNow}=require('../helpers/date'),
    {transferFunc}=require('./walletController'),
    {testReq}=require('./taskController')


const orderDB = db.get('Order')

const orderRouter=new Router({prefix:'/order'})
orderRouter
    .post('/create',        check,  createOrder)
    .get('/all',            getAllOrder)
    .get('/cancel/:id',     check,  isSelfOp,   cancelOrder)


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
    passdata.createTime=getNow()
    let makeStatus=await testReq(passdata.tid,passdata.createTime)
    if(makeStatus!==-1)
    {
        passdata.oid=uuid()
        passdata.uid=ctx.state.user[0].uid
        passdata.status='open'
        passdata.price=makeStatus
        ctx.redirect('/success')
        await next()
    }
    ctx.redirect('/failure')
    await next()
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

//todo
async function noticeNotFinish(tid){
    await orderDB.find({tid:tid},{status:'taskFin'},{multi:true})

}

//todo
async function payByTask(tid,type,amount,uid='') {
    uidList=await orderDB.find({tid:tid,status:type}).then((doc)=>{return doc})
    for (let index = 0; index < uidList.length; index++) {
        const element = uidList[index];
        await transferFunc(tid,element.uid,amount)
    }
}

async function countOrder(tid,uid='') {
    if(uid!=='')
        return await orderDB.count({tid:tid,uid:uid})
    else
        return await orderDB.count({tid:tid})
}

module.exports={orderRouter,noticeNotFinish,payByTask,countOrder}