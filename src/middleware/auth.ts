import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';

const userModel = new UserModel();

export interface AuthRequest extends Request {
  userId?: string;
  adminId?: string;
  isAdmin?: boolean;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'your-secret-key') as { id: string, email: string, type: string };

    // Only allow user tokens for address operations, reject admin tokens
    if (decoded.type === 'admin') {
      res.status(403).json({ success: false, message: 'Admin access not allowed for user addresses' });
      return;
    }

    // Check if user exists
    const user = await userModel.findById(decoded.id);
    if (!user) {
      res.status(403).json({ success: false, message: 'User account not found' });
      return;
    }

    // Attach user ID to request
    req.userId = decoded.id;
    req.isAdmin = false;

    next();
  } catch (error) {
    console.error('User authentication error:', error);
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};