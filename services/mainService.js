const {readData,writeData}=require("../utils/fileStorage")
const idGen=require("../utils/idGenerator")
const cryptoService=require("./cryptoService")

const FILE="data/data.json"

exports.create=function(data){

const list=readData(FILE)

const item={
id:idGen(list),
title:data.title,
secret:cryptoService.encrypt(data.secret)
}

list.push(item)

writeData(FILE,list)

return item

}

exports.list=function(){
return readData(FILE)
}

exports.remove=function(id){

const list=readData(FILE)

const newList=list.filter(i=>i.id!=id)

writeData(FILE,newList)

}