async function renderIndex(ctx,next)
{
    let title='Test console'
    await ctx.render('index',{
        title
    })
}

module.exports={
    renderIndex
}