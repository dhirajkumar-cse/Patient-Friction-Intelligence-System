import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { UserRole } from '../models/User.js';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Authorized roles: [${allowedRoles.join(', ')}]. Current role: [${
          req.user?.role || 'unauthenticated'
        }].`,
      });
      return;
    }
    next();
  };
};
