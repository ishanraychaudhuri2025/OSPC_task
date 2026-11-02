import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import newsletterHandler from './api/newsletter';
import communityActivityHandler from './api/community-activity';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');

// Apply safe defaults to both local Express and self-hosted production responses.
// Vercel deployments receive the same headers from vercel.json.
app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }

  next();
});

// Keep API request bodies small. The newsletter endpoint accepts only a few text fields.
app.use(express.json({ limit: '16kb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Match Vercel's API method handling in local development. The shared handler
// serves POST signups and authenticated GET activity lookups, and returns 405
// for unsupported methods.
app.all('/api/newsletter', (req: Request, res: Response) => {
  return newsletterHandler(req, res);
});

// Backward-compatible alias for older clients.
app.all('/api/community-activity', (req: Request, res: Response) => {
  return communityActivityHandler(req, res);
});

// Configure Vite middleware in development vs Static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[Server] Running with Vite middleware mode in development');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Serving compiled static assets from dist/ in production');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('[Server] WHY, PRACTICED server is listening');
  });
}

startServer().catch((err) => {
  // Do not dump request data or environment values to logs.
  console.error('[Server] Startup failed:', err instanceof Error ? err.message : 'unknown error');
  process.exit(1);
});
