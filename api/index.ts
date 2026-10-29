import type { Request, Response } from 'express';
import app from '../src/server/app.js';

// Vercel Serverless Function entry point
// Forwards incoming requests to the decoupled Express application
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
