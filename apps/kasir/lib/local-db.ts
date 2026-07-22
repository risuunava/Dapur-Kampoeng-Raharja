import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'dapur-kampoeng-kasir';
const DB_VERSION = 1;
const STORE_NAME = 'transaksi';

export interface TransaksiLocal {
  id: string;
  invoice: string | null;
  items: Array<{ menu_id: string; name: string; qty: number; price: number }>;
  total: number;
  created_at: string;
  kasir_id: string;
  device_id: string;
  sync_status: 'pending' | 'syncing' | 'synced_db' | 'synced_sheets' | 'failed';
  retry_count: number;
  last_error?: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('sync_status', 'sync_status');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveTransaksiLocal(t: TransaksiLocal): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, t);
}

export async function getPendingTransaksi(): Promise<TransaksiLocal[]> {
  const db = await getDb();
  const index = db.transaction(STORE_NAME, 'readonly').store.index('sync_status');
  const pending = await index.getAll('pending');
  const failed = await index.getAll('failed');
  return [...pending, ...failed];
}

export async function updateSyncStatus(
  id: string,
  status: TransaksiLocal['sync_status'],
  retry_count?: number,
  last_error?: string
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const existing = await store.get(id);
  if (existing) {
    existing.sync_status = status;
    if (retry_count !== undefined) existing.retry_count = retry_count;
    if (last_error !== undefined) existing.last_error = last_error;
    await store.put(existing);
  }
  await tx.done;
}

export async function getTransaksiById(id: string): Promise<TransaksiLocal | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

export async function getAllTransaksiLocal(): Promise<TransaksiLocal[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function deleteTransaksiLocal(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
