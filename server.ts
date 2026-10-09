import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import newsletterHandler from './api/newsletter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security and request parsing
app.use(express.json({ limit: '16kb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Newsletter Opt-in Endpoint (Unified Vercel & Express handler)
app.post('/api/newsletter', (req: Request, res: Response) => {
  return newsletterHandler(req, res);
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
    console.log(`[Server] WHY, PRACTICED server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
