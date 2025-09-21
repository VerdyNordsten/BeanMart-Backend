import type { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { RegisterUserSchema } from '../validation/schemas';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import type { AuthRequest } from '../middleware/auth';

const userModel = new UserModel();

export class AuthController {
  // User registration
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const userData = RegisterUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await userModel.findByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({ success: false, message: 'User with this email already exists' });
        return;
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Create user with hashed password
      const newUser = await userModel.create({
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
        passwordHash: hashedPassword
      });
      
      // Remove password from response
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        fullName: newUser.full_name,
        created_at: newUser.created_at
      };
      
      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, type: 'user' },
        process.env.JWT_SECRET ?? 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.status(201).json({ 
        success: true, 
        data: userWithoutPassword,
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error registering user', error });
      }
    }
  }

  // User login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, isAdmin } = req.body;
      
      // Validate input
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }
      
      if (isAdmin) {
        // Admin login - direct database query since we removed AdminModel
        const query = 'SELECT * FROM admins WHERE email = $1';
        const result: QueryResult = await pool.query(query, [email]);
        const admin = result.rows.length > 0 ? result.rows[0] : null;
        
        if (!admin) {
          res.status(401).json({ success: false, message: 'Invalid email or password' });
          return;
        }
        
        // Check if admin is active
        if (!admin.is_active) {
          res.status(401).json({ success: false, message: 'Admin account is inactive' });
          return;
        }
        
        // Check password
        if (!admin.password_hash) {
          res.status(500).json({ success: false, message: 'Admin account not properly configured' });
          return;
        }
        
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        if (!isPasswordValid) {
          res.status(401).json({ success: false, message: 'Invalid email or password' });
          return;
        }
        
        // Remove password from response
        const adminWithoutPassword = {
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          is_active: admin.is_active,
          created_at: admin.created_at,
          updated_at: admin.updated_at
        };
        
        // Generate JWT token
        const token = jwt.sign(
          { id: admin.id, email: admin.email, type: 'admin' },
          process.env.JWT_SECRET ?? 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
          success: true, 
          data: adminWithoutPassword,
          token 
        });
      } else {
        // User login
        const user = await userModel.findByEmail(email);
        if (!user) {
          res.status(401).json({ success: false, message: 'Invalid email or password' });
          return;
        }
        
        // Check password
        if (!user.password_hash) {
          res.status(500).json({ success: false, message: 'User account not properly configured' });
          return;
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
          res.status(401).json({ success: false, message: 'Invalid email or password' });
          return;
        }
        
        // Remove password from response
        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.full_name,
          created_at: user.created_at
        };
        
        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, type: 'user' },
          process.env.JWT_SECRET ?? 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
          success: true, 
          data: userWithoutPassword,
          token 
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error logging in', error });
    }
  }

  // Get current user/admin profile
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const adminId = req.adminId;
      const isAdmin = req.isAdmin;
      
      if (!userId && !adminId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      
      if (isAdmin && adminId) {
        // Get admin profile - direct database query since we removed AdminModel
        const query = 'SELECT * FROM admins WHERE id = $1';
        const result: QueryResult = await pool.query(query, [adminId]);
        const admin = result.rows.length > 0 ? result.rows[0] : null;
        
        if (!admin) {
          res.status(404).json({ success: false, message: 'Admin not found' });
          return;
        }
        
        // Remove password from response
        const adminWithoutPassword = {
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          is_active: admin.is_active,
          created_at: admin.created_at,
          updated_at: admin.updated_at
        };
        res.status(200).json({ success: true, data: adminWithoutPassword });
      } else if (!isAdmin && userId) {
        // Get user profile
        const user = await userModel.findById(userId);
        if (!user) {
          res.status(404).json({ success: false, message: 'User not found' });
          return;
        }
        
        // Remove password from response
        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.full_name,
          created_at: user.created_at
        };
        res.status(200).json({ success: true, data: userWithoutPassword });
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching profile', error });
    }
  }
}