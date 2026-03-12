const express=require("express")
const app=express()

const routes=require("../routes/main")

app.use(express.json())
app.use(express.static("frontend"))

app.use("/api",routes)

app.listen(3000,()=>{
console.log("Server started")
})