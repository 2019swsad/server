const url='localhost:27017/data'
const Joi = require('joi'),
    monk=require('monk'),
    ObjectId=require('mongodb').ObjectID,
    uuid=require('uuid/v4'),
    passport=require('koa-passport')

    // Simple user schema, more info: https://github.com/hapijs/joi
const userRegSchema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(30).trim().required(),
        password:Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
        email: Joi.string().email({ minDomainSegments: 2, }),
        phone:Joi.string().min(11).max(11)
    });
const db=monk(url)
db.then(()=>{console.log('Correct');})
const collection = db.get('Person')

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
    console.log(username+''+password);
    
    if (username === user.username && password === user.password) {
    done(null, user)
    } else {
    done(null, false)
    }
}))

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
 * 
 * @example curl -XGET "localhost:8081/users/check/test1"
 */
async function nameIsExist(ctx,next){
    ctx.body=await collection.find({username: ctx.params.name}).then((doc) => {
        if (doc.length>0) {
            return true
        }
        else{
            return false
        }})
    ctx.status = 200;
    await next()
}

/**
* @example curl -XGET "http://localhost:8081/users"
*/
async function list (ctx, next) {
    ctx.body=await collection.find().then((docs)=>{return docs})
    await next();
}

/**
 * @example 
 * curl -XPOST "http://localhost:8081/users/reg" -d '{"name":"New record 1"}' -H 'Content-Type: application/json'
 */
async function registerUser (ctx, next) {
    let passData = await Joi.validate(ctx.request.body, userRegSchema);
    passData.uid=uuid()
    console.log(passData)
    ctx.body=await collection.insert(passData)
    ctx.cookies.set(
        passData.username,
        passData.uid,
        {
            maxAge:24*60*60*1000
        }
    )
    ctx.status = 201;
    //ctx.redirect('/')
    await next();
}

/**
 * @example curl -XPOST "http://localhost:8081/users/login" -d '{"username":"test1","password":"123"}' -H 'Content-Type: application/json'
 */
async function loginUser (ctx, next) {
    passport.authenticate('local', {
        successRedirect: '/app',
        failureRedirect: '/'
      })
    
    status=await collection.find({
        username: ctx.request.body.username,
        password: ctx.request.body.password})
        .then((doc) => {
            console.log(doc);
            
            if (doc.length>0) {
                return doc[0].uid
            }
            else{
                return 'null'
            }})
    console.log(status);
    
    if(status!=='null')
    {
        ctx.cookies.set(
            ctx.request.body.username,
            status,
            {
                maxAge:24*60*60*1000
            }
        )
        ctx.session.set()
        console.log(ctx.session.views)
    }
    ctx.status = 200;
    //ctx.redirect('/')
    await next();
}

/**
 * @example curl -XGET "http://localhost:8081/users/logout" 
 */
async function logoutUser (ctx, next) {
    ctx.logout()
    ctx.redirect('/')
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

module.exports = {
    getId, 
    list, 
    registerUser, 
    updateUser, 
    removeUser,
    nameIsExist,
    loginUser,
    logoutUser
};
