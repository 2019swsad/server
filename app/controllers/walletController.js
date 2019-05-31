const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {getNow}=require('../helpers/date'),
    {check,isSelfOp}=require('../helpers/auth')


const walletDB = db.get('Wallet')
const transDB = db.get('transactions')

const walletRouter=new Router({prefix:'/wallet'})
walletRouter
    .get('/balance',        check,  getBalance)
    .get('/create',         check,  createWalletWeb)
    .get('/deposit/:num',   check,  depositWallet)      //temp API
    .get('/transaction',    check,  getTransactions)
    .post('/transaction',   check,  makeTransactions)
    .post('/update',        check,  updateTransactions) //discussing


/**
 * @example curl -XGET "http://localhost:8081/wallet/balance"
 */
async function getBalance (ctx, next) {
    ctx.body=await queryBalance(ctx.state.user[0].uid)
    ctx.status = 201
    await next()
}

/**
 * @example curl -XGET "http://localhost:8081/wallet/create"
 */
async function createWalletWeb (ctx, next) {
    ctx.body=await createWallet(ctx.state.user[0].uid,false)
    ctx.status = 201
    await next()
}


/**
 * @example curl -XGET "http://localhost:8081/wallet/deposit/:amount"
 */
async function depositWallet (ctx, next) {
    console.log(ctx.params.num);
    
    ctx.body=await walletDB
        .findOneAndUpdate({uid:ctx.state.user[0].uid},{$set:{balance:ctx.params.num}})
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
    console.log(ctx.request.body)
    
    isTrans=doTransactions(ctx.request.body)
    if(isTrans)
        ctx.redirect('/success')
    else
        ctx.redirect('/fail')
    ctx.status = 201
    await next()
}



/**
 * @example curl -XPOST "http://localhost:8081/wallet/update"
 * date amount receiver sender status o(rder)id 
 */
async function updateTransactions (ctx, next) {
    ctx.body=await transDB
        .insert({
            date:getNow(),
            amount:ctx.request.body.amount,
            receiver:ctx.request.body.rec,
            sender:ctx.request.body.sender,
            status:0,
            oid:uuid()})
        .then((doc)=>{if(doc.length!==0) return doc.transaction; else return []})
    ctx.status = 201
    await next()
}



/**
 * 
 * @param {*} id int
 */
async function queryBalance(id) {
    return await walletDB.findOne({uid:id}).then((doc)=>{return doc.balance})
}

/**
 * make real transfer
 * @param {string} sender 
 * @param {string} receiver 
 * @param {number} amount 
 * @returns boolean
 */
async function transfer(sender, receiver, amountstr) {
    amount=parseInt(amountstr)
    senderres = await walletDB.findOne({uid:sender})
        .then((doc)=>{
            num=parseInt(doc.balance)
            if(num>=amount)
                return num-amount
            return -1
        })
    console.log('sdr'+senderres);
    
    recres = await walletDB.findOne({uid:receiver})
        .then((doc)=>{
            num=parseInt(doc.balance)
            return num+amount
        })
    console.log('rec'+recres);
    if(senderres>=0){
        console.log('write amount info')
        res=await walletDB.findOneAndUpdate({uid:sender},{$set:{balance:senderres}})
            .then((upd)=>{return true})
        res=await walletDB.findOneAndUpdate({uid:receiver},{$set:{balance:recres}})
        .then((upd)=>{return true})
        return res
    }
       
    return false
}

/**
 * 
 * @param {string} id 
 * @param {boolean} isTask 
 */
async function createWallet(id,isT) {
    return await walletDB
        .insert({uid:id,balance:0,wid:uuid(),isTask:isT})
        .then((doc)=>{return true})
}


/**
 * 
 * @param {*} info {sender,rec,amount}
 */
async function doTransactions(info) {
    isTransfer=await transfer(
        info.sender,
        info.receiver,
        info.amount)
    if(isTransfer)
    {
        console.log('write log')
        await transDB
            .insert({
                date:getNow(),
                amount:info.amount,
                receiver:info.receiver,
                sender:info.sender,
                status:0,
                oid:uuid()})
        return true
    }    
    else
        return false
}

/**
 * 
 * @param senderId string
 * @param recid string
 * @param {int} amount int
 * @returns boolean
 */
async function transferFunc(senderid,recid,amount) {
    res=doTransactions({sender:senderid,receiver:recid,amount:amount})
    if(res.length===0)
        return false
    else
        return true
}

/**
 * 
 * @param {*} id uuid
 */
async function removeWallet(id) {
    if(queryBalance(id)>0)
        return false
    else{
        await walletDB.remove({uid:id})
        return true
    }
    
}

module.exports={
    walletRouter,
    createWallet,
    transferFunc,
    queryBalance,
    removeWallet
}