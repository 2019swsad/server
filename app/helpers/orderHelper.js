const {transferFunc}=require('../helpers/walletHelper'),
    {testReq}=require('../helpers/taskHelper'),
    db=require('../helpers/db')

const orderDB = db.get('Order')
//todo
async function noticeNotFinish(tid){
    await orderDB.find({tid:tid},{status:'taskFin'},{multi:true})

}

//todo
async function payByTask(tid,type,amount,uid='') {
    uidList=await orderDB.find({tid:tid,status:type}).then((doc)=>{return doc})
    for (let index = 0; index < uidList.length; index++) {
        const element = uidList[index];
        await transferFunc(tid,element.uid,amount)
    }
}

async function countOrder(tid,uid='') {
    if(uid!=='')
        return await orderDB.count({tid:tid,uid:uid})
    else
        return await orderDB.count({tid:tid})
}

module.exports={countOrder,payByTask,noticeNotFinish}