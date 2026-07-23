import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { syncTransaksiToSheets } from '../services/sheets.service';
import { authenticate, requireRole } from '../middleware/auth';

const router: ReturnType<typeof Router> = Router();

async function generateInvoice(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase.rpc('generate_invoice_number', {
    target_date: today,
  });

  if (error) {
    throw new Error(
      `Gagal generate invoice: ${error.message}. ` +
      'Pastikan fungsi generate_invoice_number sudah di-deploy ' +
      '(jalankan database/migrations/001_atomic_invoice_counter.sql di Supabase SQL Editor).'
    );
  }

  return data as string;
}

router.post('/', authenticate, requireRole('admin', 'kasir'), async (req: Request, res: Response) => {
  try {
    const { id, items, total, kasir_id, device_id } = req.body;

    if (!id || !items || !total || !kasir_id) {
      return res.status(400).json({ error: 'Data transaksi tidak lengkap' });
    }

    const { data: existing } = await supabase
      .from('transaksi')
      .select('*')
      .eq('id', id)
      .single();

    if (existing) {
      return res.json({ data: existing });
    }

    const invoice = await generateInvoice();

    const { data, error } = await supabase
      .from('transaksi')
      .insert({
        id,
        invoice,
        items,
        total,
        kasir_id,
        device_id: device_id || 'unknown',
        sync_status: 'synced_db',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ data });

    syncTransaksiToSheets(data.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
