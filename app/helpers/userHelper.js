const db=require('../helpers/db')
const personDB=db.get('Person')

async function queryPerson(uid) {
    res=await personDB.find({uid:uid}).then((doc)=>{return doc})
    fin.uid=res.uid
    fin.username=res.username
    fin.credit=res.credit
    fin.phone=res.phone
    fin.url=res.url
    return fin
}

module.exports={queryPerson}