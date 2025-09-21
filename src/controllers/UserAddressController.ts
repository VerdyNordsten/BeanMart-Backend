import type { Request, Response } from 'express';
import { UserAddressModel } from '../models/UserAddressModel';
import { CreateUserAddressSchema, UpdateUserAddressSchema } from '../validation/schemas';
import { z } from 'zod';

const userAddressModel = new UserAddressModel();

export class UserAddressController {
  // Get all addresses for a user
  async getUserAddresses(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const addresses = await userAddressModel.findByUserId(user_id);
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user addresses', error });
    }
  }

  // Get user address by ID
  async getUserAddressById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const address = await userAddressModel.findById(id);
      
      if (!address) {
        res.status(404).json({ success: false, message: 'User address not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user address', error });
    }
  }

  // Create a new user address
  async createUserAddress(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const addressData = CreateUserAddressSchema.parse(req.body);
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

  // Update user address
  async updateUserAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const addressData = UpdateUserAddressSchema.parse(req.body);
      const updatedAddress = await userAddressModel.update(id, addressData);
      
      if (!updatedAddress) {
        res.status(404).json({ success: false, message: 'User address not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedAddress });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating user address', error });
      }
    }
  }

  // Delete user address
  async deleteUserAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await userAddressModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'User address not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'User address deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting user address', error });
    }
  }

  // Set address as default
  async setDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      const address = await userAddressModel.setDefault(id, user_id);
      
      if (!address) {
        res.status(404).json({ success: false, message: 'User address not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error setting default address', error });
    }
  }
}