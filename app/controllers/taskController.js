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
        tags:Joi.string(),
        position:Joi.string()
    })

const taskQuerySchema = Joi.object().keys({
        title:Joi.string().min(1).max(60).trim(),
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
    .post('/participate',       selectParticipator)
    .post('/query',             queryTaskByOneElement)
    .post('/change',            check,  changeStatus)
    .get('/get/:id',            check,  getTaskbyID)
    .get('/getCreate',          check,  getCreateTask)
    .get('/getjoin',            check,  getJoinTask)
    .get('/all',                getAllTask)
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
  ctx.body = await walletDB.findOne({tid:ctx.params.id}).then((doc)=>{return doc.finishNumber})
  ctx.status = 201
  await next()
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
  else {
    ctx.body = false
  }
  ctx.body = judge
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
    // usr=await queryPerson(res.uid)
    ctx.body=res
    ctx.body.userinfo=await queryPerson(res.uid).then((doc)=>{return doc})
    console.log(ctx.body)
    ctx.status = 201
    await next()
}

/**
 * @example curl -XPOST "http://localhost:8081/task/query"  -d '{"title":"test task"}' -H 'Content-Type: application/json'
 */
async function queryTaskByOneElement(ctx,next) {
    let passData = await Joi.validate(ctx.request.body, taskQuerySchema)
    if(passData.title!=null){
      ctx.body=await taskDB.find({title:passData.title}).then((doc)=>{return doc})
    }
    else if(passData.type!=null){
      ctx.body=await taskDB.find({type:passData.type}).then((doc)=>{return doc})
    }
    else if(passData.salary!=null){
      ctx.body=await taskDB.find({salary:passData.salary}).then((doc)=>{return doc})
    }
    else if(passData.description!=null){
      ctx.body=await taskDB.find({description:passData.description}).then((doc)=>{return doc})
    }
    else if(passData.beginTime!=null){
      ctx.body=await taskDB.find({beginTimev:passData.beginTime}).then((doc)=>{return doc})
    }
    else if(passData.expireTime!=null){
      ctx.body=await taskDB.find({expireTime:passData.expireTime}).then((doc)=>{return doc})
    }
    else if(passData.participantNum!=null){
      ctx.body=await taskDB.find({participantNum:passData.participantNum}).then((doc)=>{return doc})
    }
    else if(passData.tags!=null){
      ctx.body=await taskDB.find({tags:passData.tags}).then((doc)=>{return doc})
    }
    else if(passData.uid!=null){
        ctx.body=await taskDB.find({tags:passData.uid}).then((doc)=>{return doc})
      }
    else {
      ctx.body=null
    }
    console.log(passData)
    ctx.status=201
    await next()
}

async function changeStatus(ctx,next) {
    res=await orderDB.findOneAndUpdate({tid:ctx.request.tid},{status:ctx.request.status}).then((doc)=>{return doc})
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


async function getCreateTask(ctx,next) {
    res=await taskDB.find({uid:ctx.state.user[0].uid}).then((doc)=>{return doc})
    ctx.body=res
    ctx.status=200
    await next()
}

async function getJoinTask(ctx,next) {
    
}
module.exports=taskRouter
