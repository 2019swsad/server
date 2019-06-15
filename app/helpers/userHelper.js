const db=require('../helpers/db')
const personDB=db.get('Person')

async function queryPerson(uid) {
    let fin=new Object()
    res=await personDB.find({uid:uid}).then((doc)=>{return doc})
    return res
}

module.exports={queryPerson}