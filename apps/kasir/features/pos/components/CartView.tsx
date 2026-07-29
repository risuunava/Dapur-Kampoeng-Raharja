"use client";

import { formatRupiah } from "@dapur-kampoeng/utils";
import { saveTransaksiLocal, TransaksiLocal } from "../../../lib/local-db";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";

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

interface UserInfo {
  id: string;
  name: string;
  role: string;
}

interface CartViewProps {
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  onBack: () => void;
  onDone: (data: ReceiptData) => void;
  user: UserInfo;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

function deviceId(): string {
  if (typeof window === "undefined") return "unknown";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

export default function CartView({
  cart, setCart, onBack, onDone, user, loading, setLoading,
}: CartViewProps) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function updateQty(menuId: string, delta: number) {
    setCart(
      cart
        .map((c) =>
          c.menu_id === menuId ? { ...c, qty: Math.max(0, c.qty + delta) } : c
        )
        .filter((c) => c.qty > 0)
    );
  }

  async function handleConfirm() {
    if (cart.length === 0) return;
    setLoading(true);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const local: TransaksiLocal = {
      id,
      invoice: null,
      items: cart.map((c) => ({
        menu_id: c.menu_id,
        name: c.name,
        qty: c.qty,
        price: c.price,
      })),
      total,
      created_at: now,
      kasir_id: user.id,
      device_id: deviceId(),
      sync_status: "pending",
      retry_count: 0,
    };

    await saveTransaksiLocal(local);

    onDone({
      id: local.id,
      invoice: null,
      total: local.total,
      items: local.items,
      sync_status: "pending",
    });

    setLoading(false);
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-line bg-surface">
        <button
          onClick={onBack}
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-md text-muted hover:bg-line transition-colors duration-180 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-ink">Order Summary</h2>
        <span className="text-xs font-bold bg-forest text-white px-2 py-1 rounded-md ml-auto">
          {cart.length} item
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <ShoppingCart className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Keranjang kosong</p>
          </div>
        )}

        {cart.map((item) => (
          <div
            key={item.menu_id}
            className="flex items-center justify-between bg-surface rounded-xl p-3 border border-line hover:shadow-md transition-shadow duration-180"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink text-sm truncate">
                {item.name}
              </p>
              <p
                className="text-xs text-muted mt-0.5"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatRupiah(item.price)}/pcs
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQty(item.menu_id, -1)}
                className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-line text-ink font-bold hover:bg-line active:scale-90 transition-all duration-180"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="w-7 text-center font-semibold text-ink"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {item.qty}
              </span>
              <button
                onClick={() => updateQty(item.menu_id, 1)}
                className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-turmeric text-forest-dark font-bold hover:bg-turmeric-deep active:scale-90 transition-all duration-180"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p
              className="w-20 text-right font-bold text-forest ml-3 shrink-0"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatRupiah(item.price * item.qty)}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-surface border-t border-line space-y-4 animate-slide-up">
        <h3 className="font-bold font-display text-ink text-base">Payment Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <span>Sub Total</span>
            <span className="font-semibold text-ink">{formatRupiah(total)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Tax (0%)</span>
            <span className="font-semibold text-ink">Rp0</span>
          </div>
          <div className="flex justify-between text-muted pb-2 border-b border-line/50">
            <span>Discount (0%)</span>
            <span className="font-semibold text-ink">Rp0</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-bold text-ink">Total</span>
            <span className="font-bold text-forest text-lg">{formatRupiah(total)}</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading || cart.length === 0}
          className="w-full py-4 mt-2 rounded-full bg-forest text-white font-bold text-base disabled:opacity-50 transition-all duration-180 active:scale-[0.98] hover:bg-forest-dark flex items-center justify-center gap-2 shadow-md shadow-forest/20"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </div>
  );
}
