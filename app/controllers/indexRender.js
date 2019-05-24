async function renderIndex(ctx,next)
{
    let title=ctx.isAuthenticated()
    await ctx.render('index',{
        title
    })
}
async function renderTest(ctx,next)
{
    await ctx.render('test')
}

module.exports={
    renderIndex,
    renderTest
}