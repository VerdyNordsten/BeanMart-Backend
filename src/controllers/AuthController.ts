import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { RegisterUserSchema } from '../validation/schemas';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
      const { password_hash, ...userWithoutPassword } = newUser;
      
      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'your-secret-key',
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
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }
      
      // Find user by email
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
      const { password_hash, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.status(200).json({ 
        success: true, 
        data: userWithoutPassword,
        token 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error logging in', error });
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // The user ID should be attached to the request by authentication middleware
      const userId = (req as any).userId;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      
      const user = await userModel.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;
      
      res.status(200).json({ success: true, data: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching profile', error });
    }
  }
}