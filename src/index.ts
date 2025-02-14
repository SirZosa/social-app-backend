import express from "express";


const app = express()
const PORT = process.env.PORT ?? 3000

app.get('/', (req, res)=>{
    res.send('hello worldd')
})

app.listen(PORT, ()=>{
    console.log(`app listening in http://localhost:${PORT}`)
})