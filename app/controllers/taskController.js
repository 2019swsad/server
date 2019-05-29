const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth')

// Task schema
const taskRegSchema = Joi.object().keys({
        title:Joi.string().min(4).max(60).trim().required(),
        salary:Joi.number().integer().min(1),
        description:Joi.string(),
        beginTime:Joi.date().min('now'),
        expireTime:Joi.date().min(Joi.ref('beginTime')).required(),
        participantNum:Joi.number().integer().min(1)
    });

const collection = db.get('Task')

const taskRouter=new Router({prefix:'/task'})
taskRouter
    .post('/create',         check,  createTask)




/**
 * @example curl -XPOST "http://localhost:8081/task/create" -d '{"title":"test task","salary":"20","description":"task for test","beginTime":"8-20-2019","expireTime":"8-22-2019","participantNum":"1"}' -H 'Content-Type: application/json'
 * tid uid(organizer) type status createtime starttime endtime description location participantNum eachSalary tags 
 */
async function createTask (ctx, next) {
    let passData = await Joi.validate(ctx.request.body, taskRegSchema)
    passData.uid=ctx.state.user[0].uid
    passData.tid=uuid()
    console.log(passData)
    ctx.body=await collection.insert(passData).then((doc)=>{return true})
    ctx.status = 201;
    await next();
}

module.exports=taskRouter
