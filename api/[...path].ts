import type { Request, Response } from 'express';
import app from '../src/server/app';

// Vercel Serverless Function catch-all handler for /api/* subpaths
// Enables zero-config Vercel routing alongside vercel.json rewrites
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
