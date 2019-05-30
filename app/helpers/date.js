const date = require("silly-datetime")

function getNow() {
    return date.format(new Date(),'YYYY-MM-DD HH:mm:ss')
}
module.exports={getNow}