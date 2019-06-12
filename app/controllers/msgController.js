const uuid=require('uuid/v4'),
    Router = require('koa-router'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth')

const taskRouter=new Router({prefix:'/msg'})
taskRouter
    .get('/',       check,  createMsgList)



async function createMsgList(ctx,next) {
    
}