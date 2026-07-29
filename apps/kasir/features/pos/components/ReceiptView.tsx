"use client";

import { formatRupiah } from "@dapur-kampoeng/utils";
import { TransaksiLocal } from "../../../lib/local-db";
import { StatusBadge } from "@dapur-kampoeng/ui";
import { Receipt, PlusCircle } from "lucide-react";

interface CartItem {
  menu_id: string;
  name: string;
  price: number;
  qty: number;
}

interface ReceiptData {
  invoice: string | null;
  id: string;
  total: number;
  items: CartItem[];
  sync_status: TransaksiLocal["sync_status"];
}

interface ReceiptViewProps {
  receipt: ReceiptData;
  onNewTransaction: () => void;
  onRetry?: () => void;
}

export default function ReceiptView({
  receipt,
  onNewTransaction,
  onRetry,
}: ReceiptViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div
        className="bg-surface rounded-2xl p-6 w-full max-w-sm border border-line"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="text-center mb-4">
          <Receipt className="w-8 h-8 text-forest mx-auto mb-2" />
          <h2
            className="text-xl font-bold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dapur Kampoeng Raharja
          </h2>
          <p className="text-sm text-muted mt-1">Struk Transaksi</p>
        </div>

        <div className="border-t border-line/50 pt-4 space-y-2 mb-4">
          {receipt.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                {item.name}{" "}
                <span className="text-muted font-medium">x{item.qty}</span>
              </span>
              <span
                className="font-semibold text-ink"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatRupiah(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-line/50 pt-4 flex items-center justify-between">
          <span
            className="font-bold text-ink text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Total
          </span>
          <span
            className="text-xl md:text-2xl font-bold text-forest"
            style={{
              fontFamily: "var(--font-display)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatRupiah(receipt.total)}
          </span>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-forest/5 border border-forest/10 text-center">
          <p className="text-xs text-muted font-medium mb-1.5">
            {receipt.invoice ? "Invoice" : "ID Transaksi"}
          </p>
          <p
            className="text-sm font-bold text-ink tracking-wider"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {receipt.invoice || receipt.id.slice(0, 8).toUpperCase()}
          </p>
          <div className="flex items-center justify-center mt-3">
            <StatusBadge status={receipt.sync_status} />
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full mt-4 py-2.5 rounded-full border border-chili/30 text-chili font-bold text-sm hover:bg-chili/5 active:scale-[0.98] transition-all duration-180 flex items-center justify-center gap-2"
          >
            Coba Kirim Ulang
          </button>
        )}

        <button
          onClick={onNewTransaction}
          className="w-full mt-3 py-3 rounded-full bg-forest text-white font-bold text-base transition-all duration-180 hover:bg-forest-dark active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-forest/20"
        >
          <PlusCircle className="w-5 h-5" />
          Transaksi Baru
        </button>
      </div>
    </div>
  );
}
