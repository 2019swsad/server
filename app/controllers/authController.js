//Auth
function check(ctx, next) {
    if (ctx.isAuthenticated()) {
      return next()
    } else {
      ctx.redirect('/')
    }
}

//Check whether is it oneself
function isSelfOp(ctx,next) {
    console.log(ctx.method);
    if(ctx.method=='GET'){
        if(ctx.state.user[0].uid===ctx.params.id){
            return next()
        }
        else{
            ctx.redirect('/')
        }
    }
    else{
        if(ctx.request.body.uid===ctx.state.user[0].uid){
            return next()
        }
        else{
            ctx.redirect('/')
        }
    }
    
}

module.exports={
    check,
    isSelfOp
}