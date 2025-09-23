import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import pool from '../config/db';

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

    if (decoded.type === 'admin') {
      // Check if admin exists and is active
      const query = 'SELECT * FROM admins WHERE id = $1 AND is_active = true';
      const result = await pool.query(query, [decoded.id]);
      const admin = result.rows.length > 0 ? result.rows[0] : null;
      
      if (!admin) {
        res.status(403).json({ success: false, message: 'Admin account not found or inactive' });
        return;
      }
      
      // Attach admin ID to request
      req.adminId = decoded.id;
      req.isAdmin = true;
    } else {
      // Check if user exists
      const user = await userModel.findById(decoded.id);
      if (!user) {
        res.status(403).json({ success: false, message: 'User account not found' });
        return;
      }

      // Attach user ID to request
      req.userId = decoded.id;
      req.isAdmin = false;
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};