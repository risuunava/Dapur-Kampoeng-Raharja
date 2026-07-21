import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router: ReturnType<typeof Router> = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let query = supabase.from('menu').select('*');

    const { date, status, category } = req.query;
    if (date) {
      query = query.lte('start_date', date).gte('end_date', date);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('category').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, category, start_date, end_date, status } = req.body;
    const { data, error } = await supabase
      .from('menu')
      .insert({ name, price, category, start_date, end_date, status })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('menu')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Menu tidak ditemukan' });
    res.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('menu').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ data: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
