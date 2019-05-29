const Joi = require('joi'),
    uuid=require('uuid/v4'),
    Router = require('koa-router'),
    passport=require('koa-passport'),
    db=require('../helpers/db'),
    {check,isSelfOp}=require('../helpers/auth')

// Simple user schema, more info: https://github.com/hapijs/joi
const userRegSchema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(30).trim().required(),
        password:Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
        email: Joi.string().email({ minDomainSegments: 2, }),
        phone:Joi.string().min(11).max(11)
    });

//DB init
const collection = db.get('Person')

const userRouter = new Router({prefix:'/users'});
userRouter
    .get('/',                   check,  list)
    .get('/self/:id',           check,  isSelfOp,   getbyId)
    .get('/checkname/:name',    nameCanU)
    .post('/reg',               registerUser)
    .get('/logout',             logoutUser)
    .post('/update',            check,  isSelfOp,   updateUser)
    .get('/delete/:id',         check,  isSelfOp,   removeUser)
    .post('/login',   passport.authenticate('local', {
        successRedirect: '/test',
        failureRedirect: '/'
    }));



//Passport
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
  


/**
 * @example curl -XGET "http://localhost:8081/users/:_id"
 */
async function getbyId (ctx, next) {
    ctx.body=await collection
        .findOne({uid:ctx.params.id})
        .then((doc)=>{return doc})
    await next();
}


/**
 * 
 * @example curl -XGET "localhost:8081/users/check/:name"
 */
async function nameCanU(ctx,next){
    ctx.body=await collection.find({username: ctx.params.name}).then((doc) => {
        if (doc.length>0) {
            return false
        }
        else{
            return true
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
    ctx.body=await collection.insert(passData).then((doc)=>{return true})
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
    await next()
}


/**
 * @example curl -XPOST "http://localhost:8081/users/update" -d '{"name":"New record 3"}' -H 'Content-Type: application/json'
 */
async function updateUser (ctx, next) {
    // let body = await Joi.validate(ctx.request.body, userSchema, {allowUnknown: true});
    
    ctx.body = await collection.findOneAndUpdate(
        {uid:ctx.request.body.uid}, 
        {$set:ctx.request.body}).then((upd)=>{return true});
    ctx.status=201
    await next();
}



/**
 * @example curl -XGET "http://localhost:8081/users/delete/:id"
 */
async function removeUser (ctx, next) {
    await collection.remove({uid:ctx.params.id});
    ctx.status = 204;
    await next();
}


module.exports = userRouter