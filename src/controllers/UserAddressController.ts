import type { Response } from 'express';
import { UserAddressModel } from '../models/UserAddressModel';
import { CreateUserAddressSchema, UpdateUserAddressSchema } from '../validation/schemas';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth';

const userAddressModel = new UserAddressModel();

export class UserAddressController {
  // Get all addresses for the authenticated user
  async getUserAddresses(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check if authentication ran
      if (!req.userId) {
        res.status(500).json({ success: false, message: 'Authentication middleware not working' });
        return;
      }

      // Get addresses for the authenticated user only
      const addresses = await userAddressModel.findByUserId(req.userId);
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user addresses', error });
    }
  }

  // Get user address by ID
  async getUserAddressById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const address = await userAddressModel.findById(id);
      if (!address) {
        res.status(404).json({ success: false, message: 'Address not found' });
        return;
      }

      res.status(200).json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user address', error });
    }
  }

  // Create a new user address
  async createUserAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Override user_id with authenticated user's ID - prevent spoofing
      const addressData = CreateUserAddressSchema.parse({
        ...req.body,
        user_id: req.userId
      });

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
  async updateUserAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // First check if address exists
      const existingAddress = await userAddressModel.findById(id);
      if (!existingAddress) {
        res.status(404).json({ success: false, message: 'Address not found' });
        return;
      }

      // Validate input and prevent user_id modification
      const addressData = UpdateUserAddressSchema.parse(req.body);
      // Remove user_id from the data to prevent modification
      const safeAddressData = { ...addressData };
      delete (safeAddressData as Record<string, unknown>).user_id;

      const updatedAddress = await userAddressModel.update(id, safeAddressData);
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
  async deleteUserAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // First check if address exists
      const existingAddress = await userAddressModel.findById(id);
      if (!existingAddress) {
        res.status(404).json({ success: false, message: 'Address not found' });
        return;
      }

      const deleted = await userAddressModel.delete(id);
      if (deleted) {
        res.status(200).json({ success: true, message: 'User address deleted successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete user address' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting user address', error });
    }
  }

  // Set address as default
  async setDefaultAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // First check if address exists
      const existingAddress = await userAddressModel.findById(id);
      if (!existingAddress) {
        res.status(404).json({ success: false, message: 'Address not found' });
        return;
      }

      const address = await userAddressModel.setDefault(id, req.userId!);
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error setting default address', error });
    }
  }
}