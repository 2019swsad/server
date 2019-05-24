const url='localhost:27017/data'
const Joi = require('joi'),
    monk=require('monk'),
    KoaBody = require('koa-body'),
    ObjectId=require('mongodb').ObjectID,
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport')

    // Simple user schema, more info: https://github.com/hapijs/joi
const userRegSchema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(30).trim().required(),
        password:Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
        email: Joi.string().email({ minDomainSegments: 2, }),
        phone:Joi.string().min(11).max(11)
    });
const db=monk(url)
db.then(()=>{console.log('Linked to DB');})
const collection = db.get('Person')


const userRouter = new Router({prefix:'/users'});
userRouter
    .get('/',               list)
    .get('/test/:id',       check,getbyId)
    .get('/checkname/:name',   nameIsExist)
    .post('/reg',           registerUser)
    .post('/login',   passport.authenticate('local', {
        successRedirect: '/test',
        failureRedirect: '/'
    }))
    .get('/logout',         logoutUser)
    .put('/:id',            check,KoaBody(), updateUser)
    .delete('/:id',         check,removeUser);

passport.serializeUser(function(user, done) {
    console.log(user);
    
    done(null, user._id.toString())
  })
  
  passport.deserializeUser(async function(id, done) {
    collection.find({_id:id}, done);
  })

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(async function(username, password, done) {
    user=await collection.find({ username: username, password: password}).then((doc)=>{return doc})
    console.log(user);
    
    if(user.length===1)
    {
      done(null,user[0])
    }
    else
    {
      done(null,false)
    }
}))
  
function check(ctx, next) {
    if (ctx.isAuthenticated()) {
      return next()
    } else {
      ctx.redirect('/')
    }
}

/**
 * @example curl -XGET "http://localhost:8081/users/:_id"
 */
async function getbyId (ctx, next) {
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
    ctx.status = 201;
    //ctx.redirect('/')
    await next();
}


/**
 * @example curl -XPOST "http://localhost:8081/users/login" -d '{"username":"test","password":"123"}' -H 'Content-Type: application/json'
 */
async function loginUser (ctx, next) {

    
    console.log('108')
    await next()
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


module.exports = userRouter