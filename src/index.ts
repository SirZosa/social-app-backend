import express from "express";
import { corsMiddleware } from "./middlewares/cors";
import { createRouter } from "./routes/api";
import type { UserModel } from "./controller/interfaces";

export const createApp = ({UserModel}:{UserModel:UserModel}) => {
    const app = express()
    const PORT = process.env.PORT ?? 3000

    app.use(express.json())
    app.use(corsMiddleware())
    app.disable('x-powered-by')
    app.use('/v1', createRouter({UserModel}))
    app.get('/', (req, res)=>{
        res.status(200).send('hello worldd')
    })
    app.listen(PORT, ()=>{
        console.log(`app listening in http://localhost:${PORT}`)
    })
}