import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate, requireRole } from '../middleware/auth';

const router: ReturnType<typeof Router> = Router();

function todayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  return { start, end };
}

function monthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  return { start, end };
}

function parseDateParam(dateStr: string | undefined, fallback: () => { start: string; end: string }): { start: string; end: string } {
  if (!dateStr) return fallback();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return fallback();
  const start = d.toISOString();
  const end = new Date(d.getTime() + 86400000).toISOString();
  return { start, end };
}

router.get('/summary', authenticate, requireRole('admin', 'kasir'), async (_req: Request, res: Response) => {
  try {
    const today = todayRange();
    const month = monthRange();

    const [todayData, monthData] = await Promise.all([
      supabase.from('transaksi').select('total').gte('created_at', today.start).lt('created_at', today.end).eq('sync_status', 'synced_db'),
      supabase.from('transaksi').select('total').gte('created_at', month.start).lt('created_at', month.end).eq('sync_status', 'synced_db'),
    ]);

    const todayTotal = (todayData.data || []).reduce((sum, t) => sum + (t.total || 0), 0);
    const monthTotal = (monthData.data || []).reduce((sum, t) => sum + (t.total || 0), 0);

    res.json({
      data: {
        total_transaksi_hari_ini: (todayData.data || []).length,
        total_pendapatan_hari_ini: todayTotal,
        total_transaksi_bulan_ini: (monthData.data || []).length,
        total_pendapatan_bulan_ini: monthTotal,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

router.get('/best-seller', authenticate, requireRole('admin', 'kasir'), async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
    const range = parseDateParam(req.query.start as string, () => {
      const m = monthRange();
      return { start: m.start, end: new Date().toISOString() };
    });

    const { data, error } = await supabase
      .from('transaksi')
      .select('items')
      .gte('created_at', range.start)
      .lte('created_at', range.end)
      .eq('sync_status', 'synced_db');

    if (error) return res.status(500).json({ error: error.message });

    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};

    for (const t of data || []) {
      const items = t.items as Array<{ name: string; qty: number; price: number }>;
      for (const item of items) {
        if (!counts[item.name]) {
          counts[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        counts[item.name].qty += item.qty;
        counts[item.name].revenue += item.price * item.qty;
      }
    }

    const sorted = Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);

    res.json({ data: sorted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

router.get('/category-sales', authenticate, requireRole('admin', 'kasir'), async (req: Request, res: Response) => {
  try {
    const range = parseDateParam(req.query.start as string, () => {
      const m = monthRange();
      return { start: m.start, end: new Date().toISOString() };
    });

    const [menuData, transaksiData] = await Promise.all([
      supabase.from('menu').select('name, category'),
      supabase
        .from('transaksi')
        .select('items')
        .gte('created_at', range.start)
        .lte('created_at', range.end)
        .eq('sync_status', 'synced_db'),
    ]);

    if (transaksiData.error) return res.status(500).json({ error: transaksiData.error.message });

    const menuMap: Record<string, string> = {};
    for (const m of menuData.data || []) {
      menuMap[m.name] = m.category;
    }

    const categoryTotals: Record<string, { category: string; qty: number; revenue: number }> = {};

    for (const t of transaksiData.data || []) {
      const items = t.items as Array<{ name: string; qty: number; price: number }>;
      for (const item of items) {
        const cat = menuMap[item.name] || 'Lainnya';
        if (!categoryTotals[cat]) {
          categoryTotals[cat] = { category: cat, qty: 0, revenue: 0 };
        }
        categoryTotals[cat].qty += item.qty;
        categoryTotals[cat].revenue += item.price * item.qty;
      }
    }

    const result = Object.values(categoryTotals).sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = result.reduce((s, c) => s + c.revenue, 0);
    const withPercentage = result.map((c) => ({
      ...c,
      percentage: totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0,
    }));

    res.json({ data: withPercentage });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

router.get('/daily-trend', authenticate, requireRole('admin', 'kasir'), async (req: Request, res: Response) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 7, 90);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);

    const { data, error } = await supabase
      .from('transaksi')
      .select('created_at, total')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString())
      .eq('sync_status', 'synced_db')
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const daily: Record<string, { date: string; total: number; count: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      daily[key] = { date: key, total: 0, count: 0 };
    }

    for (const t of data || []) {
      const key = new Date(t.created_at).toISOString().slice(0, 10);
      if (daily[key]) {
        daily[key].total += t.total || 0;
        daily[key].count += 1;
      }
    }

    const sorted = Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ data: sorted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
