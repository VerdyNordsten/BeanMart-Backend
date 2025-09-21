import type { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { UserAddressModel } from '../models/UserAddressModel';
import { CreateUserSchema, UpdateUserSchema } from '../validation/schemas';
import { z } from 'zod';

const userModel = new UserModel();
const userAddressModel = new UserAddressModel();

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
      // Validate input
      const userData = CreateUserSchema.parse(req.body);
      const newUser = await userModel.create(userData);
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating user', error });
      }
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const userData = UpdateUserSchema.parse(req.body);
      const updatedUser = await userModel.update(id, userData);
      
      if (!updatedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating user', error });
      }
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

  // Get user addresses
  async getUserAddresses(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Check if user exists
      const user = await userModel.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      
      const addresses = await userAddressModel.findByUserId(id);
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user addresses', error });
    }
  }

  // Create user address
  async createUserAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Check if user exists
      const user = await userModel.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      
      // Add user_id to the request body and validate
      const addressData = {
        ...req.body,
        userId: id
      };
      
      const newAddress = await userAddressModel.create(addressData);
      res.status(201).json({ success: true, data: newAddress });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating user address', error });
      }
    }
  }
}