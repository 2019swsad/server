const url='localhost:27017/data'
const Joi = require('joi'),
    monk=require('monk'),
    ObjectId=require('mongodb').ObjectID,
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport')

const db=monk(url)
db.then(()=>{console.log('Linked to DB');})
const collection = db.get('Wallet')

const walletRouter=new Router({prefix:'/wallet'})
walletRouter
    .get('/balance',        check,  getBalance)
    .get('/create',         check,  createWallet)   



function check(ctx, next) {
    if (ctx.isAuthenticated()) {
      return next()
    } else {
      ctx.redirect('/')
    }
}

/**
 * @example curl -XGET "http://localhost:8081/wallet/balance"
 */
async function getBalance (ctx, next) {
    ctx.body=await collection
        .findOne({uid:ctx.state.user[0].uid})
        .then((doc)=>{return doc.balance})
    ctx.status = 201;
    await next();
}

/**
 * @example curl -XGET "http://localhost:8081/wallet/create"
 */
async function createWallet (ctx, next) {
    ctx.body=await collection
        .insert({uid:ctx.state.user[0].uid,balance:0.0,wid:uuid()})
        .then((doc)=>{return true})
    ctx.status = 201;
    await next();
}

module.exports=walletRouter