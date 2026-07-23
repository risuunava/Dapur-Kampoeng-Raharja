export type SyncStatus = 'pending' | 'syncing' | 'synced_db' | 'synced_sheets' | 'failed';

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: string;
  date: string;
  status: 'tersedia' | 'habis';
  image_url?: string | null;
}

export interface TransaksiItem {
  menu_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface Transaksi {
  id: string;
  invoice: string | null;
  items: TransaksiItem[];
  total: number;
  created_at: string;
  kasir_id: string;
  device_id: string;
  sync_status: SyncStatus;
}

export interface User {
  id: string;
  name: string;
  username: string;
  pin_hash: string;
  role: 'admin' | 'kasir';
}
