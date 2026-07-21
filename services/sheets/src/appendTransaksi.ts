import { sheets, SPREADSHEET_ID } from './client';

export interface TransaksiRow {
  waktu: string;
  invoice: string;
  menu: string;
  qty: number;
  harga: number;
  total: number;
  kasir: string;
}

export async function appendTransaksiToSheet(row: TransaksiRow): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn('[Sheets] SPREADSHEET_ID belum dikonfigurasi — skip append');
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Transaksi!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.waktu,
        row.invoice,
        row.menu,
        row.qty,
        row.harga,
        row.total,
        row.kasir,
      ]],
    },
  });
}

export async function appendBatchToSheet(rows: TransaksiRow[]): Promise<void> {
  if (!SPREADSHEET_ID || rows.length === 0) return;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Transaksi!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows.map((r) => [r.waktu, r.invoice, r.menu, r.qty, r.harga, r.total, r.kasir]),
    },
  });
}
