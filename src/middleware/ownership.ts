import type { NextFunction, Response } from 'express';
import type { AuthRequest } from './auth';

// Simple, general-purpose ownership middleware
// Usage: checkOwnership(model, idParamName, userIdField)
export const checkOwnership = <T>(
  model: { findById(id: string): Promise<T | null> },
  idParamName: string = 'id',
  userIdField: string = 'user_id'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entityId = req.params[idParamName];

      // If no entity ID in params, skip ownership check
      if (!entityId) {
        return next();
      }

      // Find the entity using the provided model
      const entity = await model.findById(entityId);
      if (!entity) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      // Check ownership
      if ((entity as Record<string, unknown>)[userIdField] !== req.userId) {
        res.status(403).json({ 
          success: false, 
          message: 'Not authorized to access this resource' 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Ownership validation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error during ownership validation'
      });
    }
  };
};