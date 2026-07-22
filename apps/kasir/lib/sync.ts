import { createTransaksi } from './api';
import { getPendingTransaksi, updateSyncStatus, TransaksiLocal } from './local-db';

type SyncCallback = (updated: TransaksiLocal) => void;

const SYNC_INTERVAL = 10000;
let timer: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let subscribers: Set<SyncCallback> = new Set();

export function subscribe(cb: SyncCallback): () => void {
  subscribers.add(cb);
  return () => { subscribers.delete(cb); };
}

function notify(t: TransaksiLocal) {
  subscribers.forEach((cb) => cb(t));
}

async function syncOne(t: TransaksiLocal): Promise<void> {
  await updateSyncStatus(t.id, 'syncing', t.retry_count);

  const syncingItem = { ...t, sync_status: 'syncing' as const };
  notify(syncingItem);

  const result = await createTransaksi({
    id: t.id,
    items: t.items,
    total: t.total,
    kasir_id: t.kasir_id,
    device_id: t.device_id,
  });

  if (result.data) {
    await updateSyncStatus(t.id, 'synced_db', 0);

    const synced: TransaksiLocal = {
      ...t,
      invoice: result.data.invoice,
      sync_status: 'synced_db',
      retry_count: 0,
    };
    notify(synced);
  } else {
    const newRetry = t.retry_count + 1;
    const isNetworkError = !result.error || result.error === 'Network error' || result.error.includes('fetch');
    const status = isNetworkError && newRetry < 10 ? 'pending' : 'failed';

    await updateSyncStatus(t.id, status, newRetry, result.error);

    const failedItem: TransaksiLocal = {
      ...t,
      sync_status: status,
      retry_count: newRetry,
      last_error: result.error,
    };
    notify(failedItem);
  }
}

export async function runSyncCycle(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  try {
    const pending = await getPendingTransaksi();
    for (const t of pending) {
      try {
        await syncOne(t);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'unknown error';
        await updateSyncStatus(t.id, 'failed', t.retry_count + 1, errorMsg);
      }
    }
  } finally {
    isRunning = false;
  }
}

export function startSyncEngine(): void {
  if (timer) return;
  runSyncCycle();
  timer = setInterval(runSyncCycle, SYNC_INTERVAL);
}

export function stopSyncEngine(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export async function retryTransaksi(id: string): Promise<void> {
  const { getTransaksiById } = await import('./local-db');
  const t = await getTransaksiById(id);
  if (!t) return;

  await updateSyncStatus(id, 'pending', t.retry_count);
  notify({ ...t, sync_status: 'pending' });

  runSyncCycle();
}
