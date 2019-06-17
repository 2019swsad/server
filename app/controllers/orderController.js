const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth'),
    {getNow}=require('../helpers/date'),

    {testReq}=require('../helpers/taskHelper')


const orderDB = db.get('Order')
const taskDB = db.get('Task')

const orderRouter=new Router({prefix:'/order'})
orderRouter
    .post('/create',        check,  createOrder)
    .get('/all',            check,  getAllOrder)
    .get('/bytask/:id',     check,  getAllOrderOfTask)
    .get('/cancel/:id',     check,  isSelfOp,   cancelOrder)
    .get('/finish/:id',     check,  finishOrder)
    .get('/get/:id',        check,  getOrderbyID)
    .get('/status/finish/:id',     check,  isSelfOp, setTaskFinish)
    .get('/status/ongoing/:id',    check,  isSelfOp, setOnGoing)
    .get('/status/start/:id',      check,  isSelfOp, setTaskStart)


// Task schema
const orderSchema = Joi.object().keys({
    tid:Joi.string().trim().required(),
    status:Joi.string().trim().required()
});

/**
 * @example curl -XPOST "http://localhost:8081/order/create" -d '{uid:"xxx",tid:"xxx",}' -H 'Content-Type: application/json'
 * oid tid status uid createTime message price
 */
async function createOrder(ctx,next) {
    let passdata=await Joi.validate(ctx.request.body,orderSchema)
    let task = await taskDB.findOne({tid:passData.tid}).then((doc)=>{return true})
    if(task.status === "已结束"){
      ctx.body = {status:'failure'}
    }
    else{
      // let passdata=ctx.request.body
      passdata.createTime=getNow()
      let makeStatus=await testReq(passdata.tid,passdata.createTime)
      if(makeStatus!==-1)
      {
          passdata.oid=uuid()
          passdata.uid=ctx.state.user[0].uid
          // passdata.status='open'
          passdata.price=makeStatus

          await orderDB.insert(passdata)

          ctx.body={status:'success'}
          ctx.status=200
          await next()
      }
      else{
          ctx.body={status:'fail'}
          ctx.status=400
          await next()
      }
    }

}

async function finishOrder(ctx,next) {
    res=await orderDB.findOneAndUpdate({tid:ctx.params.id},{status:'finish'})
        .then((doc)=>{return true})
    if(res){
        ctx.body={status:'success'}
        ctx.status=200
    }
    else{
        ctx.body={status:'failed'}
        ctx.status=400
    }
    await next()

}

async function getOrderbyID(ctx,next) {
    res=await orderDB.findOne({oid:ctx.params.id}).then((doc)=>{return doc})
    if(res.uid===ctx.state.user[0].uid){
        ctx.body=res
        ctx.status=200
        console.log('get order success :83')
    }
    else{
        ctx.body={status:'fail'}
        ctx=status=400
        console.log('get order fail :88')
    }
    await next()
}


/**
* @example curl -XGET "http://localhost:8081/order/all"
*/
async function getAllOrder (ctx, next) {
    ctx.body=await orderDB.find({uid:ctx.state.user[0].uid}).then((docs)=>{return docs})
    await next();
}

async function getAllOrderOfTask(ctx,next) {
    ctx.body=await orderDB.find({tid:ctx.params.id}).then((docs)=>{return docs})
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

/**
 * @example curl -XGET "http://localhost:8081/task/finish/:id"
 */
async function setTaskFinish(ctx, next){
  res = await orderDB.findOneAndUpdate({tid:ctx.params.id},{$set:{status:"已结束"}}).then((doc)=>{return doc})
  res.status = "已结束"
  ctx.body = res.status
  ctx.status = 201
  console.log(res)
  await next()
}

/**
 * @example curl -XGET "http://localhost:8081/task/ongoing/:id"
 */
async function setOnGoing(ctx, next){
  res = await orderDB.findOneAndUpdate({tid:ctx.params.id},{$set:{status:"进行中"}}).then((doc)=>{return doc})
  res.status = "进行中"
  ctx.body = res.status
  ctx.status = 201
  console.log(res)
  await next()
}

/**
 * @example curl -XGET "http://localhost:8081/task/start/:id"
 */
async function setTaskStart(ctx, next){
  res = await orderDB.findOneAndUpdate({tid:ctx.params.id},{$set:{status:"未开始"}}).then((doc)=>{return doc})
  res.status = "未开始"
  ctx.body = res.status
  ctx.status = 201
  console.log(res)
  await next()
}

module.exports=orderRouter
