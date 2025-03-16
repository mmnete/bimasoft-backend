// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';

const API_KEY: string | undefined = process.env.API_KEY;

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey: string | undefined = req.headers['x-api-key'] as string;
    if (!apiKey || apiKey !== API_KEY) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    next();
};