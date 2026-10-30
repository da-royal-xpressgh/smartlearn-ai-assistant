import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/server/app.js';

// Vercel Serverless Function entry point
// Forwards incoming requests to the decoupled Express application
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
