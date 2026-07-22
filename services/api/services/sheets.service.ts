import { appendBatchToSheet } from '@dapur-kampoeng/sheets';
import type { TransaksiRow } from '@dapur-kampoeng/sheets';
import { supabase } from '../lib/supabase';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryAppend(
  rows: TransaksiRow[],
  maxRetries = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await appendBatchToSheet(rows);
      return;
    } catch (err: unknown) {
      const isRateLimit =
        (err as { status?: number })?.status === 429 ||
        (err as { code?: number })?.code === 429 ||
        (err as Error)?.message?.includes('429') ||
        (err as Error)?.message?.includes('rateLimit');

      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.warn(`[Sheets] Rate limit, retry dalam ${delay}ms (percobaan ${attempt}/${maxRetries})`);
        await sleep(delay);
        continue;
      }

      throw err;
    }
  }
}

export async function syncTransaksiToSheets(transaksiId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*, kasir:kasir_id(name)')
      .eq('id', transaksiId)
      .single();

    if (error || !data) {
      console.error(`[Sheets] Transaksi ${transaksiId} tidak ditemukan`);
      return;
    }

    if (data.sync_status === 'synced_sheets') return;

    const items = data.items as Array<{ name: string; qty: number; price: number }>;
    const kasirName = (data.kasir as { name?: string })?.name || data.kasir_id;

    const rows: TransaksiRow[] = items.map((item) => ({
      waktu: data.created_at,
      invoice: data.invoice || '',
      menu: item.name,
      qty: item.qty,
      harga: item.price,
      total: item.price * item.qty,
      kasir: kasirName,
    }));

    await retryAppend(rows);

    await supabase
      .from('transaksi')
      .update({ sync_status: 'synced_sheets' })
      .eq('id', transaksiId);

    console.log(`[Sheets] Transaksi ${data.invoice} berhasil di-sync (${rows.length} item)`);
  } catch (err) {
    console.error(`[Sheets] Gagal sync transaksi ${transaksiId}:`, err);
  }
}
