async function renderIndex(ctx,next)
{
    let title=ctx.isAuthenticated()
    let username=ctx.state.user[0].username
    await ctx.render('index',{
        username,
        title
    })
}
async function renderTest(ctx,next)
{
    let username=ctx.state.user[0].username
    //console.log(ctx.state.user);
    
    await ctx.render('test',{
        username
    })
}

module.exports={
    renderIndex,
    renderTest
}