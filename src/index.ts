import express from "express";


const app = express()
const PORT = process.env.PORT ?? 3000
app.use(express.json())
app.disable('x-powered-by')
app.get('/', (req, res)=>{
    res.status(200).send('hello worldd')
})

app.post('/login', (req, res)=>{})
app.post('/register', (req, res)=>{})
app.post('/logout', (req, res)=>{})
app.post('/protected', (req, res)=>{}) 


app.listen(PORT, ()=>{
    console.log(`app listening in http://localhost:${PORT}`)
})