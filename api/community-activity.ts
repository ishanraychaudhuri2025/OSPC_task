import type { Request, Response } from 'express';
import newsletterHandler from './newsletter';

// Backward-compatible route for older cached frontend bundles.
// Keep activity reads on the exact same Firebase Admin adapter used by newsletter signup.
export default async function handler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ ok: false, message: 'Method Not Allowed' });
    return;
  }

  await newsletterHandler(req, res);
}
