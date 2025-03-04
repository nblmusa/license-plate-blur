import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    plan: string;
  };
}

export const authenticateRequest: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header' });
    return;
  }

  // Check if it's an API key or JWT token
  if (authHeader.startsWith('ApiKey ')) {
    const apiKey = authHeader.split(' ')[1];
    authenticateApiKey(apiKey, req as AuthenticatedRequest, res, next);
    return;
  } else if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    authenticateJWT(token, req as AuthenticatedRequest, res, next);
    return;
  }

  res.status(401).json({ error: 'Invalid authorization header' });
};

function authenticateApiKey(
  apiKey: string,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!apiKey.startsWith('lpm_')) {
    res.status(401).json({ error: 'Invalid API key format' });
    return;
  }

  // In a production environment, you would validate this against your database
  // and check if the API key is active and within its rate limits
  
  // For now, we'll do a simple hash comparison
  const hash = crypto
    .createHmac('sha256', process.env.API_KEY_SALT || '')
    .update(apiKey)
    .digest('hex');

  // Here you would compare the hash with the stored hash in your database
  // For demo purposes, we'll just set a user object
  req.user = {
    id: hash.substring(0, 8),
    plan: 'api'
  };

  next();
}

function authenticateJWT(
  token: string,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
      id: string;
      plan: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
} 