import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { supabase } from './lib/supabase';
import menuRoutes from './routes/menu';
import transaksiRoutes from './routes/transaksi';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
