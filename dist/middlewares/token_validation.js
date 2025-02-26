import jwt from 'jsonwebtoken';
import 'dotenv/config';
export async function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: 'Access denied! No token provided.' });
        return;
    }
    try {
        req.body.user = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || '');
        next();
    }
    catch (error) {
        res.status(400).json({ message: 'Unable to authenticate' });
    }
}
//# sourceMappingURL=token_validation.js.map