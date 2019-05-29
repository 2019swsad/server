const url='localhost:27017/data'
const Joi = require('joi'),
    monk=require('monk'),
    ObjectId=require('mongodb').ObjectID,
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport')

// Task schema
const taskRegSchema = Joi.object().keys({
        title:Joi.string().alphanum().min(4).max(60).trim().required(),
        salary:Joi.number().integer().min(1),
        describtion:Joi.string(),
        beginTime:Joi.date().min('now'),
        expireTime:Joi.date().min(Joi.ref('beginTime')).required(),
        participantNum:Joi.number().integer().min(1)
    });

const db=monk(url)
db.then(()=>{console.log('Linked to DB');})
const collection = db.get('Task')

const walletRouter=new Router({prefix:'/task'})
walletRouter
    .get('/create',         check,  createTask)

function check(ctx, next) {
    if (ctx.isAuthenticated()) {
      return next()
    } else {
      ctx.redirect('/')
    }
}

/**
 * @example curl -XPOST "http://localhost:8081/task/create" -d '{"title":"test task","salary":"20","describtion":"task for test","beginTime":"8-20-2019","expireTime":"8-22-2019","participantNum":"1"}' -H 'Content-Type: application/json'
 */
async function createTask (ctx, next) {
    let passData = await Joi.validate(ctx.request.body, taskRegSchema)
    //passData.uid=uuid()
    console.log(passData)
    ctx.body=await collection.insert(passData).then((doc)=>{return true})
    ctx.status = 201;
    //ctx.redirect('/')
    await next();
}

module.exports=walletRouter
