const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth')


const walletDB = db.get('Wallet')
const transDB = db.get('transactions')

const walletRouter=new Router({prefix:'/wallet'})
walletRouter
    .get('/balance',        check,  getBalance)
    .get('/create',         check,  createWalletWeb)
    .get('/deposit/:amount',check,  depositWallet)      //temp API
    .get('/transaction',    check,  getTransactions)
    .post('/transaction',   check,  makeTransactions)
    .post('/update',        check,  updateTransactions) //discussing


/**
 * @example curl -XGET "http://localhost:8081/wallet/balance"
 */
async function getBalance (ctx, next) {
    ctx.body=await walletDB
        .findOne({uid:ctx.state.user[0].uid})
        .then((doc)=>{return doc.balance})
    ctx.status = 201;
    await next();
}

/**
 * @example curl -XGET "http://localhost:8081/wallet/create"
 */
async function createWalletWeb (ctx, next) {
    ctx.body=await createWallet(ctx.state.user[0].uid,false)
    ctx.status = 201;
    await next();
}


/**
 * @example curl -XGET "http://localhost:8081/wallet/deposit/:amount"
 */
async function depositWallet (ctx, next) {
    ctx.body=await walletDB
        .findOneAndUpdate({uid:ctx.state.user[0].uid},{$set:{amount:ctx.param.amount}})
        .then((doc)=>{if(doc.length!==0) return true; else return false})
    ctx.status = 201
    await next()
}

/**
 * @example curl -XGET "http://localhost:8081/wallet/transaction"
 * date amount receiver(uid) sender(uid) status o(rder)id 
 */
async function getTransactions (ctx, next) {
    let receive_trans = await transDB
        .find({receiver:ctx.state.user[0].uid})
        .then((doc)=>{if(doc.length!==0) return doc.transaction; else return []})
    let send_trans = await transDB
        .find({sender:ctx.state.user[0].uid})
        .then((doc)=>{if(doc.length!==0) return doc.transaction; else return []})
    receive_trans.push(...send_trans)
    ctx.body=receive_trans
    ctx.status = 201
    await next()
}

/**
 * @example curl -XPOST "http://localhost:8081/wallet/transaction"
 * date amount receiver sender status o(rder)id 
 */
async function makeTransactions (ctx, next) {
    isTransfer=await transfer(
        ctx.request.body.sender,
        ctx.request.body.receiver,
        ctx.request.body.amount)
    if(isTransfer)
        ctx.body=await transDB
            .insert({
                date:Date(),
                amount:ctx.request.body.amount,
                receiver:ctx.request.body.rec,
                sender:ctx.request.body.sender,
                status:0,
                oid:uuid()})
            .then((doc)=>{if(doc.length!==0) return doc.transaction; else return []})
    ctx.status = 201;
    await next();
}


/**
 * @example curl -XPOST "http://localhost:8081/wallet/update"
 * date amount receiver sender status o(rder)id 
 */
async function updateTransactions (ctx, next) {
    ctx.body=await transDB
        .insert({
            date:Date(),
            amount:ctx.request.body.amount,
            receiver:ctx.request.body.rec,
            sender:ctx.request.body.sender,
            status:0,
            oid:uuid()})
        .then((doc)=>{if(doc.length!==0) return doc.transaction; else return []})
    ctx.status = 201;
    await next();
}


/**
 * make real transfer
 * @param {string} sender 
 * @param {string} receiver 
 * @param {number} amount 
 */
async function transfer(sender, receiver, amount) {
    senderres = await walletDB.findOne({uid:sender})
        .then((doc)=>{
            if(doc[0].balance>=amount)
                return doc[0].balance-amount
        })
    recres = await walletDB.findOne({uid:receiver})
        .then((doc)=>{
            if(doc[0].balance>=amount)
                return doc[0].balance+amount
        })
    if(senderres>=0)
        res=await walletDB.findOneAndUpdate({uid:sender},{$set:{amount:senderres}})
            .then((upd)=>{return true})
        res=await walletDB.findOneAndUpdate({uid:receiver},{$set:{amount:recres}})
        .then((upd)=>{return true})
}

/**
 * 
 * @param {string} id 
 * @param {boolean} isTask 
 */
async function createWallet(id,isT) {
    return await walletDB
        .insert({uid:id,balance:0.0,wid:uuid(),isTask:isT})
        .then((doc)=>{return true})
}

/**
 * 
 * @param {userid} uid string
 * @param {taskid} tid string
 * @param {int} amount int
 */
async function chargeToTask(uid,tid,amount) {
    userBalance=await walletDB
        .findOne({uid:uid,isTask:false})
        .then((doc)=>{
            if(doc[0].balance>=amount)
                return doc[0].balance
        })
}

module.exports={walletRouter,createWallet}