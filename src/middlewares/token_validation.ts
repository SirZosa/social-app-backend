import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { Request, Response, NextFunction } from 'express'

export async function authenticate(req:Request, res:Response, next:NextFunction) {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Access denied! No token provided.' });
        return
    }
    try {
      req.body.user = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || '');
      next();
    } catch (error) {
      res.status(400).json({ message: 'Unable to authenticate' });
    }
  }