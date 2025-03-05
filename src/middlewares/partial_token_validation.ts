import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { Request, Response, NextFunction } from 'express'

export async function partialAuthenticate(req:Request, res:Response, next:NextFunction) {
    const token = req.cookies.token;
    if (!token) {
        console.log("here")
        req.body.user = false
        next()
    }
    else{
        try {
            console.log("here2")
            console.log(token)
            req.body.user = jwt.verify(token, process.env.JWT_SECRET || '');
            next();
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: 'Unable to authenticate' });
        }
    }
}