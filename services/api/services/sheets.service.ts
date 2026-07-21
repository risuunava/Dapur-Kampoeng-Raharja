import { appendTransaksiToSheet } from '@dapur-kampoeng/sheets';
import { supabase } from '../lib/supabase';

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

    for (const item of items) {
      try {
        await appendTransaksiToSheet({
          waktu: data.created_at,
          invoice: data.invoice || '',
          menu: item.name,
          qty: item.qty,
          harga: item.price,
          total: item.price * item.qty,
          kasir: kasirName,
        });
      } catch (err) {
        console.error(`[Sheets] Gagal append item ${item.name}:`, err);
      }
    }

    await supabase
      .from('transaksi')
      .update({ sync_status: 'synced_sheets' })
      .eq('id', transaksiId);

    console.log(`[Sheets] Transaksi ${data.invoice} berhasil di-sync`);
  } catch (err) {
    console.error(`[Sheets] Gagal sync transaksi ${transaksiId}:`, err);
  }
}
