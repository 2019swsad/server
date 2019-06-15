const uuid=require('uuid/v4'),
    Router = require('koa-router'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth'),
    {queryMsgList,createMsg}=require('../helpers/msgHelper')

const taskRouter=new Router({prefix:'/msg'})
taskRouter
    .get('/list',          check,  createMsgList)
    .post('/commemt',      check,  createComment)
    .post('/create',       chech,  createMsg)

const msgDB = db.get('Massage')

async function createMsgList(ctx,next) {
  ctx.body=await queryMsgList(ctx.state.user[0].uid)
  ctx.status = 201
  await next()
}

/**
 * @example curl -XPOST "http://localhost:8081/msg/comment" -d '{"uid":"...","msg":"test"}' -H 'Content-Type: application/json'
 * @param uid: msg receiver
 */
async function createComment(ctx,next){
  ctx.body=await createMsg(ctx.request.body.uid,ctx.state.user[0].uid,"comment",ctx.request.body.msg)
  ctx.status = 201
  await next()
}

/**
 * @example curl -XPOST "http://localhost:8081/msg/create" -d '{"uid":"...","type":"comment","msg":"test"}' -H 'Content-Type: application/json'
 * @param uid: msg receiver
 */
async function createMsg(ctx,next){
  ctx.body=await createMsg(ctx.request.body.uid,ctx.state.user[0].uid,ctx.request.body.type,ctx.request.body.msg)
  ctx.status = 201
  await next()
}
