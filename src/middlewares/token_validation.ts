import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { Request, Response, NextFunction } from 'express'

export async function authenticate(req:Request, res:Response, next:NextFunction) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'Access denied! No token provided.' });
    try {
      req.body.user = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || '');
      next();
    } catch (error) {
      return res.status(400).json({ message: 'Unable to authenticate' });
    }
  }