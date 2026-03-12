const service=require("../services/mainService")

exports.create=(req,res)=>{
const item=service.create(req.body)
res.json(item)
}

exports.list=(req,res)=>{
const data=service.list()
res.json(data)
}

exports.remove=(req,res)=>{
service.remove(req.params.id)
res.json({message:"deleted"})
}