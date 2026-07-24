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

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface DashboardSummary {
  total_transaksi_hari_ini: number;
  total_pendapatan_hari_ini: number;
  total_transaksi_bulan_ini: number;
  total_pendapatan_bulan_ini: number;
}

export interface BestSellerItem {
  name: string;
  qty: number;
  revenue: number;
}

export interface CategorySalesItem {
  category: string;
  qty: number;
  revenue: number;
  percentage: number;
}

export interface DailyTrendItem {
  date: string;
  total: number;
  count: number;
}