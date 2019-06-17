const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth'),
    {getNow}=require('../helpers/date'),
    {_,createMsg}=require('../helpers/msgHelper'),
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
    .get('/enroll',         check,  signupTask)
    //.get('/status/finish/:id',     check,  isSelfOp, setTaskFinish)
    .get('/status/ongoing/:id',    check,  setOnGoing)
    //.get('/status/start/:id',      check,  isSelfOp, setTaskStart)
    .get('/status/pending/:id',    check,  setOrderPending)


// Task schema
const orderSchema = Joi.object().keys({
    tid:Joi.string().trim().required(),
    status:Joi.string().trim()
});

/**
 * @example curl -XPOST "http://localhost:8081/order/create" -d '{uid:"xxx",tid:"xxx",}' -H 'Content-Type: application/json'
 * oid tid status uid createTime message price
 */
async function createOrder(ctx,next) {
    let passdata=await Joi.validate(ctx.request.body,orderSchema)
    let task = await taskDB.findOne({tid:passdata.tid}).then((doc)=>{return doc})
    if(task.status === "已结束"){
      ctx.body = {status:'failure'}
    }
    else{
      if(task.currentParticipator < task.participantNum){
         task.currentParticipator=task.currentParticipator+1
          // let passdata=ctx.request.body
          passdata.createTime=getNow()
          let makeStatus=await testReq(passdata.tid,passdata.createTime)
          if(makeStatus!==-1) {
              passdata.oid=uuid()
              passdata.uid=ctx.state.user[0].uid
              passdata.status='success'
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

      else{
          task.candidate += 1
          // let passdata=ctx.request.body
          passdata.createTime=getNow()
          let makeStatus=await testReq(passdata.tid,passdata.createTime)
          if(makeStatus!==-1) {
              passdata.oid=uuid()
              passdata.uid=ctx.state.user[0].uid
              passdata.status='pending'
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
  }


/**
 * @example curl -XPOST "http://localhost:8081/order/enroll" -d '{uid:"xxx",tid:"xxx",}' -H 'Content-Type: application/json'
 * oid tid status uid createTime message price
 */
async function signupTask(ctx,next) {
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
          passdata.status='pending'
          passdata.price=makeStatus

          await orderDB.insert(passdata)
          await createMsg(ctx.request.body.uid,ctx.state.user[0].uid,"enrollment",ctx.request.body.msg,"有新的报名者")

          ctx.body={status:'pending'}
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
 * @example curl -XGET "http://localhost:8081/task/pending/:id"
 */
async function setOrderPending(ctx, next){
  let taskObj = await taskDB.findOne({tid:passData.tid}).then((doc)=>{return true})
  if(taskObj.status === "已结束"){
    ctx.body = {status:'failure'}
  }
  taskObj.currentParticipator=taskObj.currentParticipator-1
  taskObj.candidate = taskObj.candidate+1
  let judge = createOrderByTask(taskObj.tid,userObj.uid)
  res = await orderDB.findOneAndUpdate({tid:ctx.params.id},{$set:{status:"pending"}}).then((doc)=>{return doc})
  res.status = "pending"
  ctx.body = res.status
  ctx.status = 201
  console.log(res)
  await next()
}

/**
 * @example curl -XGET "http://localhost:8081/task/ongoing/:id"
 */
async function setOnGoing(ctx, next){
  let taskObj = await taskDB.findOne({tid:passData.tid}).then((doc)=>{return true})
  if(taskObj.status === "已结束"){
    ctx.body = {status:'failure'}
  }
  taskObj.currentParticipator=taskObj.currentParticipator+1
  taskObj.candidate = taskObj.candidate-1
  let judge = createOrderByTask(taskObj.tid,userObj.uid)
  res = await orderDB.findOneAndUpdate({tid:ctx.params.id},{$set:{status:"success"}}).then((doc)=>{return doc})
  res.status = "success"
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
