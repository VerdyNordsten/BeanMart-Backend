import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import type { QueryResult } from 'pg';

export interface AdminAuthRequest extends Request {
  adminId?: string;
  isAdmin?: boolean;
}

export const authenticateAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'your-secret-key') as { id: string, email: string };
    
    // Check if admin exists and is active using direct database query
    const query = 'SELECT * FROM admins WHERE id = $1 AND is_active = true';
    const result: QueryResult = await pool.query(query, [decoded.id]);
    const admin = result.rows.length > 0 ? result.rows[0] : null;
    
    if (!admin) {
      res.status(403).json({ success: false, message: 'Admin account not found or inactive' });
      return;
    }
    
    // Attach admin ID to request
    req.adminId = decoded.id;
    req.isAdmin = true;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};