import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { User } from '../models';

const userModel = new UserModel();

export class UserController {
  // Get all users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userModel.findAll();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching users', error });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);
      
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user', error });
    }
  }

  // Create a new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: Omit<User, 'id' | 'created_at'> = req.body;
      const newUser = await userModel.create(userData);
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating user', error });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData: Partial<User> = req.body;
      const updatedUser = await userModel.update(id, userData);
      
      if (!updatedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating user', error });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await userModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting user', error });
    }
  }
}