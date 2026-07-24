"use client";

import { useState } from "react";
import { formatRupiah } from "@dapur-kampoeng/utils";
import { TransaksiLocal } from "../../../lib/local-db";
import { StatusBadge } from "@dapur-kampoeng/ui";
import { ArrowLeft, RefreshCw, ClipboardList } from "lucide-react";

type SyncStatus = TransaksiLocal["sync_status"];

interface HistoryViewProps {
  history: TransaksiLocal[];
  syncStatuses: Record<string, SyncStatus>;
  onRetry: (id: string) => void;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

const filterOptions: Array<{ key: string; label: string }> = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "synced_db", label: "Tersinkron" },
  { key: "failed", label: "Gagal" },
];

export default function HistoryView({
  history,
  syncStatuses,
  onRetry,
  onBack,
  onRefresh,
}: HistoryViewProps) {
  const [statusFilter, setStatusFilter] = useState("semua");
  const [refreshing, setRefreshing] = useState(false);

  const filtered =
    statusFilter === "semua"
      ? history
      : history.filter(
          (t) => (syncStatuses[t.id] || t.sync_status) === statusFilter
        );

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-6 py-5 border-b border-line bg-surface">
        <h2
          className="text-2xl font-bold text-ink font-display"
        >
          Riwayat Transaksi
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs text-muted hover:text-ink transition-colors duration-180 flex items-center gap-1"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Muat ulang
        </button>
      </div>

      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-line bg-surface/50">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-180 active:scale-95 ${
              statusFilter === f.key
                ? "bg-forest text-white shadow-sm"
                : "bg-surface text-muted border border-line hover:border-forest/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Belum ada transaksi</p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((t) => {
            const status = syncStatuses[t.id] || t.sync_status;
            return (
              <div
                key={t.id}
                className="bg-surface rounded-md p-3 border border-line hover:shadow-md transition-all duration-180"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={status} />
                    </div>
                    <p
                      className="text-xs text-muted font-mono"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {t.invoice || t.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-muted mt-1 line-clamp-1">
                      {t.items.map((i) => i.name).join(", ")}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-sm font-bold text-ink"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatRupiah(t.total)}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(t.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {status === "failed" && (
                    <button
                      onClick={() => onRetry(t.id)}
                      className="ml-2 px-2.5 py-1 rounded-md text-[11px] font-semibold text-chili bg-chili/5 border border-chili/20 active:bg-chili/10 active:scale-95 transition-all duration-180 shrink-0"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
