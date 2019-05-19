const url='localhost:27017/data'
const Joi = require('joi'),
    monk=require('monk'),
    ObjectId=require('mongodb').ObjectID

    // Simple user schema, more info: https://github.com/hapijs/joi
const userSchema = Joi.object().keys({
        name: Joi.string().trim().required()
    });
const db=monk(url)
db.then(()=>{console.log('Correct');})
const collection = db.get('Person')


/**
 * @example curl -XGET "http://localhost:8081/users/:_id"
 */
async function getId (ctx, next) {
    ctx.body=await collection
        .findOne({_id:ObjectId(ctx.params.id)})
        .then((doc)=>{return doc})
    await next();
}


/**
* @example curl -XGET "http://localhost:8081/users"
*/
async function list (ctx, next) {
    ctx.body=await collection.find().then((docs)=>{return docs})
    await next();
}

/**
 * @example curl -XPOST "http://localhost:8081/users" -d '{"name":"New record 1"}' -H 'Content-Type: application/json'
 */
async function registerUser (ctx, next) {
    // let body = await Joi.validate(ctx.request.body, userSchema, {allowUnknown: true});
    console.log(ctx.request.body);
    console.log(ctx);
    
    ctx.body=await collection.insertOne(ctx.request.body)
    ctx.status = 201;
    await next();
}

/**
 * @example curl -XPUT "http://localhost:8081/users/:_id" -d '{"name":"New record 3"}' -H 'Content-Type: application/json'
 */
async function updateUser (ctx, next) {
    // let body = await Joi.validate(ctx.request.body, userSchema, {allowUnknown: true});
    console.log(ctx.params.id);
    ctx.body = await collection.findOneAndUpdate(
        {_id:ObjectId(ctx.params.id)}, 
        {$set:ctx.request.body}).then((upd)=>{});
    await next();
}

/**
 * @example curl -XDELETE "http://localhost:8081/users/:id"
 */
async function removeUser (ctx, next) {
    await collection.remove({_id:ObjectId(ctx.params.id)});
    ctx.status = 204;
    await next();
}

module.exports = {getId, list, registerUser, updateUser, removeUser};
