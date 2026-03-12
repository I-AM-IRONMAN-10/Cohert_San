const crypto=require("crypto")

const key="hardcodedkey"

exports.encrypt=function(text){

const cipher=crypto.createCipher("aes-256-cbc",key)

let encrypted=cipher.update(text,"utf8","hex")

encrypted+=cipher.final("hex")

return encrypted

}