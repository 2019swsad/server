const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth'),
    {getNow,isEarly}=require('../helpers/date'),
    {countOrder,payByTask,noticeNotFinish,createOrderByTask}=require('../helpers/orderHelper'),
    {updateUserFunc}=require('./userController'),
    {createWallet,transferFunc}=require('../helpers/walletHelper'),
    {queryPerson}=require('../helpers/userHelper')

// Task schema
const taskRegSchema = Joi.object().keys({
        title:Joi.string().min(4).max(60).trim().required(),
        type:Joi.string().required(),
        salary:Joi.number().integer().min(1).required(),
        description:Joi.string(),
        beginTime:Joi.date().min('now').required(),
        expireTime:Joi.date().min(Joi.ref('beginTime')).required(),
        participantNum:Joi.number().integer().min(1).required(),
        tags:Joi.string()
    })

const taskQuerySchema = Joi.object().keys({
        title:Joi.string().min(4).max(60).trim(),
        type:Joi.string(),
        salary:Joi.number().integer().min(1),
        description:Joi.string(),
        beginTime:Joi.date().min('now'),
        expireTime:Joi.date().min(Joi.ref('beginTime')),
        participantNum:Joi.number().integer().min(1),
        tags:Joi.string()
    })

const taskDB = db.get('Task')
const userDB = db.get('Person')

const taskRouter=new Router({prefix:'/task'})
taskRouter
    .post('/create',            check,  createTask)
    .get('/all',                getAllTask)
    .get('/cancel/:tid',        check,  isSelfOp, applyCancel)
    .post('/participate',       selectParticipator)
    .get('/get/:id',            check,  getTaskbyID)
    .post('/query',             queryTaskByOneElement)
    .get('/number/:id',         check,  isSelfOp, getFinishNum)



/**
 * @example curl -XPOST "http://localhost:8081/task/create" -d '{"title":"test task","type":"Questionaire","salary":"20","description":"task for test","beginTime":"8-20-2019","expireTime":"8-22-2019","participantNum":"1","tags":"Testing"}' -H 'Content-Type: application/json'
 * tid uid(organizer) type status createtime starttime endtime description location participantNum eachSalary tags
 */
async function createTask (ctx, next) {
    let passData = await Joi.validate(ctx.request.body, taskRegSchema)
    passData.uid=ctx.state.user[0].uid
    passData.tid=uuid()
    passData.status="start"
    passData.totalCost=passData.salary*passData.participantNum
    passData.createTime=getNow()
    passData.currentParticipator=0
    passData.finishNumber=Buffer.from([Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10)]);
    console.log(passData)
    await createWallet(passData.tid,true)

    //TODO: need to handle failure
    chargeStatus=await transferFunc(ctx.state.user[0].uid,passData.tid,passData.totalCost)
    console.log(chargeStatus)

    ctx.body=await taskDB.insert(passData).then((doc)=>{return doc.tid})
    ctx.status = 201
    await next()
}

/**
* @example curl -XGET "http://localhost:8081/task/all"
*/
async function getAllTask (ctx, next) {
    ctx.body=await taskDB.find().then((docs)=>{return docs})
    ctx.status = 201
    await next()
}

/**
* @example curl -XGET "http://localhost:8081/task/number/:id"
* @param id:tid
*/
async function getFinishNum(ctx, next){
  number = await walletDB.findOne({tid:ctx.params.id}).then((doc)=>{return doc.finishNumber})
  ctx.status = 201
  await next()
}

/**
* @example curl -XGET "http://localhost:8081/task/cancel/:id"
* Todo : do as how 用例图 do
*/
async function applyCancel(ctx,next) {
    taskObj=await taskDB.findOne({tid:ctx.params.id}).then((doc)=>{return doc})
    if(taskObj.uid!==ctx.state.user[0].uid)
        return false
    if(isEarly(getNow(),taskObj.endtime)){                  //if not reach the end time
        updateUserFunc({uid:taskObj.uid,credit:'low'})      //?
        payByTask(taskObj.tid,'notFin',0.3*taskObj.eachSalary)
    }
    finishTask(taskObj.tid)

}

/**
 * @example curl -XPOST "http://localhost:8081/task/participate" -d '{"tid":"...","uid":"..."}' -H 'Content-Type: application/json'
 * @param tid: taskid
 * @param uid: selected user
 */
async function selectParticipator(ctx, next){
  taskObj=await taskDB.findOne({tid:ctx.params.tid}).then((doc)=>{return doc})
  userObj=await userDB.findOne({uid:ctx.params.uid}).then((doc)=>{return doc})
  if(taskObj.currentParticipator < taskObj.participantNum){
    taskObj.currentParticipator=taskObj.currentParticipator+1
    let judge = createOrderByTask(taskObj.tid,userObj.uid)
  }

  ctx.status = 201
  await next()
}

/**
 * @example curl -XGET "http://localhost:8081/task/id"
 */
async function getTaskbyID(ctx,next) {
    res=await taskDB.findOne({tid:ctx.params.id}).then((doc)=>{return doc})
    if(res.uid===ctx.state.user[0].uid)
        res.isOrganizer=true
    else
        res.isOrganizer=false

    res.userinfo=queryPerson(res.uid)
    ctx.body=res
    console.log(ctx.body)
    ctx.status = 201
    await next()
}

/**
 * @example curl -XPOST "http://localhost:8081/task/query"  -d '{"title":"test task"}' -H 'Content-Type: application/json'
 */
async function queryTaskByOneElement(ctx,next) {
    let passData = await Joi.validate(ctx.request.body, taskRegSchema)
    if(passData.title!=null){
      res=await taskDB.findOne({title:passData.title}).then((doc)=>{return doc})
    }
    else if(passData.type!=null){
      res=await taskDB.findOne({type:passData.type}).then((doc)=>{return doc})
    }
    else if(passData.salary!=null){
      res=await taskDB.findOne({salary:passData.salary}).then((doc)=>{return doc})
    }
    else if(passData.description!=null){
      res=await taskDB.findOne({description:passData.description}).then((doc)=>{return doc})
    }
    else if(passData.beginTime!=null){
      res=await taskDB.findOne({beginTimev:passData.beginTime}).then((doc)=>{return doc})
    }
    else if(passData.expireTime!=null){
      res=await taskDB.findOne({expireTime:passData.expireTime}).then((doc)=>{return doc})
    }
    else if(passData.participantNum!=null){
      res=await taskDB.findOne({participantNum:passData.participantNum}).then((doc)=>{return doc})
    }
    else if(passData.tags!=null){
      res=await taskDB.findOne({tags:passData.tags}).then((doc)=>{return doc})
    }
    console.log(passData)
    ctx.status=201
    await next()
}



module.exports=taskRouter
