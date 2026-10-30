import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.GEMINI_API_KEY?.trim();

  return res.status(200).json({
    ok: true,
    hasKey: !!key,
    keyLength: key ? key.length : 0,
    keyPrefix: key ? key.substring(0, 4) : 'N/A',
  });
}
