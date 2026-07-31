import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { supabase } from './lib/supabase';
import menuRoutes from './routes/menu';
import transaksiRoutes from './routes/transaksi';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';

const app: Express = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

// Selalu izinkan origin dari Capacitor (Android & iOS) dan localhost
const capacitorOrigins = [
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
  'ionic://localhost',
];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || capacitorOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());
const publicPath = process.env.VERCEL ? path.join(__dirname, '../public') : path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.get('/favicon.ico', (_req, res) => res.sendFile(path.join(publicPath, 'favicon.ico')));
app.get('/favicon.png', (_req, res) => res.sendFile(path.join(publicPath, 'favicon.png')));
app.get('/', (_req, res) => {
  res.json({
    name: 'Dapur Kampoeng API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/health/db', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('menu').select('*').limit(1);
    if (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
    res.json({ status: 'connected', data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ status: 'error', message });
  }
});

app.use('/menu', menuRoutes);
app.use('/transaksi', transaksiRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/upload', uploadRoutes);

const PORT = process.env.PORT || 4000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}

export default app;
