"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@dapur-kampoeng/utils";
import {
  getDashboardSummary,
  getBestSeller,
  getCategorySales,
  getDailyTrend,
} from "../../../lib/api";
import type {
  DashboardSummary,
  BestSellerItem,
  CategorySalesItem,
  DailyTrendItem,
} from "../../../lib/api";

export default function DashboardView({ onBack }: { onBack: () => void }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [bestSellers, setBestSellers] = useState<BestSellerItem[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesItem[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [s, b, c, t] = await Promise.all([
      getDashboardSummary(),
      getBestSeller(5, periodStart),
      getCategorySales(periodStart),
      getDailyTrend(7),
    ]);
    if (s.data) setSummary(s.data);
    if (b.data) setBestSellers(b.data);
    if (c.data) setCategorySales(c.data);
    if (t.data) setDailyTrend(t.data);
    setLoading(false);
  }, [periodStart]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const maxTrend = Math.max(...dailyTrend.map((d) => d.total), 1);

  return (
    <div className="flex-1 flex flex-col bg-bg">
      <div className="flex items-center justify-between px-6 py-5 border-b border-line bg-surface">
        <h2 className="text-2xl font-bold text-ink font-display">
          Dashboard Owner
        </h2>
        <button
          onClick={fetchAll}
          className="text-xs text-muted hover:text-ink transition-colors duration-180"
        >
          Muat ulang
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading && !summary && (
          <p className="text-center text-muted py-8">Memuat data...</p>
        )}

        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-sm p-4 border border-line">
              <p className="text-xs text-muted mb-1">Transaksi Hari Ini</p>
              <p className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
                {summary.total_transaksi_hari_ini}
              </p>
            </div>
            <div className="bg-surface rounded-sm p-4 border border-line">
              <p className="text-xs text-muted mb-1">Pendapatan Hari Ini</p>
              <p className="text-lg font-bold text-forest" style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
                {formatRupiah(summary.total_pendapatan_hari_ini)}
              </p>
            </div>
            <div className="bg-surface rounded-sm p-4 border border-line">
              <p className="text-xs text-muted mb-1">Transaksi Bulan Ini</p>
              <p className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
                {summary.total_transaksi_bulan_ini}
              </p>
            </div>
            <div className="bg-surface rounded-sm p-4 border border-line">
              <p className="text-xs text-muted mb-1">Pendapatan Bulan Ini</p>
              <p className="text-lg font-bold text-forest" style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
                {formatRupiah(summary.total_pendapatan_bulan_ini)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-surface rounded-sm border border-line p-4">
          <h3 className="font-semibold text-ink text-sm mb-3">Tren 7 Hari</h3>
          {dailyTrend.length > 0 && (
            <div className="flex items-end gap-1.5 h-32">
              {dailyTrend.map((d) => {
                const pct = (d.total / maxTrend) * 100;
                const dayLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short' });
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {d.total > 0 ? formatRupiah(d.total).replace(/^Rp\s?/, '') : ''}
                    </span>
                    <div
                      className="w-full bg-turmeric/70 rounded-t-sm transition-all duration-300"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                    <span className="text-[10px] text-muted">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-sm border border-line p-4">
          <h3 className="font-semibold text-ink text-sm mb-3">Menu Terlaris</h3>
          {bestSellers.length === 0 && (
            <p className="text-xs text-muted">Belum ada data penjualan</p>
          )}
          <div className="space-y-2">
            {bestSellers.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs font-bold text-muted w-4 shrink-0">#{i + 1}</span>
                  <span className="text-sm text-ink truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {item.qty} pcs
                  </span>
                  <span className="text-xs font-semibold text-forest" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatRupiah(item.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-sm border border-line p-4">
          <h3 className="font-semibold text-ink text-sm mb-3">Penjualan per Kategori</h3>
          {categorySales.length === 0 && (
            <p className="text-xs text-muted">Belum ada data penjualan</p>
          )}
          <div className="space-y-3">
            {categorySales.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink">{cat.category}</span>
                  <span className="text-xs text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {cat.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest rounded-full transition-all duration-300"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatRupiah(cat.revenue)} — {cat.qty} pcs
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
