import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired token' });
      return;
    }
    
    // Attach user ID to request
    req.userId = (decoded as any).id;
    next();
  });
};