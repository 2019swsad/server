const {transferFunc}=require('../helpers/walletHelper'),
    {testReq}=require('../helpers/taskHelper'),
    db=require('../helpers/db'),
    {getNow}=require('../helpers/date')

const msgDB = db.get('Massage')

/**
 * @param {string} uid
 */
async function queryMsgList(id) {
    return await msgDB.find({uid:id})
}

/**
 * @param {string} msg receiver uid
 * @param {string} msg sender uid
 */
async function createMsg(id,id2,type,msg){
  return await msgDB.insert({uid:id,sender:id2,mid:uuid(),type:type,msg:msg}).then((doc)=>{return true})
}

module.exports={queryMsgList,createMsg}
