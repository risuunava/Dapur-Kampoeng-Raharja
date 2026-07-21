"use client";

import { useState } from "react";
import { login as apiLogin, getMenu, createTransaksi } from "../../lib/api";
import { formatRupiah } from "@dapur-kampoeng/utils";

type View = "login" | "menu" | "cart" | "receipt";

interface UserInfo {
  id: string;
  name: string;
  role: string;
}

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
}

function deviceId(): string {
  if (typeof window === 'undefined') return 'unknown';
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
}

export default function KasirApp() {
  const [view, setView] = useState<View>("login");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  // login state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // menu & cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  function handleLoginSuccess(u: UserInfo) {
    setUser(u);
    setView("menu");
    setPin("");
  }

  function handleLogout() {
    sessionStorage.removeItem('token');
    setUser(null);
    setCart([]);
    setReceipt(null);
    setView("login");
  }

  function handleTransactionDone(data: ReceiptData) {
    setReceipt(data);
    setCart([]);
    setView("receipt");
  }

  function handleNewTransaction() {
    setView("menu");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {view !== "login" && user && (
        <header className="bg-forest-dark text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Dapur Kampoeng
            </span>
            <span className="text-xs bg-white/15 px-2 py-0.5 rounded">{user.name}</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-white/70 hover:text-white">
            Keluar
          </button>
        </header>
      )}

      <main className="flex-1 flex flex-col">
        {view === "login" && (
          <LoginView
            username={username}
            setUsername={setUsername}
            pin={pin}
            setPin={setPin}
            error={loginError}
            setError={setLoginError}
            loading={loading}
            setLoading={setLoading}
            onSuccess={(u) => {
              setLoginError("");
              handleLoginSuccess(u);
            }}
          />
        )}
        {view === "menu" && user && (
          <MenuView
            user={user}
            cart={cart}
            setCart={setCart}
            onViewCart={() => setView("cart")}
          />
        )}
        {view === "cart" && user && (
          <CartView
            cart={cart}
            setCart={setCart}
            onBack={() => setView("menu")}
            onDone={handleTransactionDone}
            user={user}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {view === "receipt" && receipt && (
          <ReceiptView receipt={receipt} onNewTransaction={handleNewTransaction} />
        )}
      </main>
    </div>
  );
}

/* ---------- LOGIN VIEW ---------- */

function LoginView({
  username, setUsername, pin, setPin,
  error, setError, loading, setLoading, onSuccess,
}: {
  username: string; setUsername: (v: string) => void;
  pin: string; setPin: (v: string) => void;
  error: string; setError: (v: string) => void;
  loading: boolean; setLoading: (v: boolean) => void;
  onSuccess: (user: UserInfo) => void;
}) {
  async function handleLogin() {
    if (!username || pin.length < 4) {
      setError("Username dan PIN 4-6 digit diperlukan");
      return;
    }
    setLoading(true);
    setError("");
    const result = await apiLogin(username, pin);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.data) {
      sessionStorage.setItem('token', result.data.token);
      onSuccess(result.data.user);
    }
  }

  function handlePinInput(digit: string) {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  }

  function handlePinBack() {
    setPin(pin.slice(0, -1));
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <h1
        className="text-2xl font-semibold text-forest-dark mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Dapur Kampoeng
      </h1>
      <p className="text-sm text-muted mb-8">Kasir — Masuk</p>

      <div className="w-full max-w-xs mb-6">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-sm border border-line bg-surface text-ink text-base mb-3 focus:outline-none focus:border-turmeric"
          autoComplete="username"
        />
        <div className="flex items-center justify-center gap-3 mb-4">
          {Array.from({ length: pin.length }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-forest" />
          ))}
          {Array.from({ length: 6 - pin.length }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full border-2 border-line" />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-chili mb-4">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-3 max-w-xs w-full mb-4">
        {["1","2","3","4","5","6","7","8","9"].map((d) => (
          <button
            key={d}
            onClick={() => handlePinInput(d)}
            className="h-14 text-xl font-bold bg-surface border border-line rounded-sm active:bg-line transition-colors duration-180"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handlePinInput("0")}
          className="h-14 text-xl font-bold bg-surface border border-line rounded-sm active:bg-line transition-colors duration-180"
        >
          0
        </button>
        <button
          onClick={handlePinBack}
          className="h-14 text-lg text-muted bg-surface border border-line rounded-sm active:bg-line transition-colors duration-180"
        >
          ⌫
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading || pin.length < 4}
        className="w-full max-w-xs py-3 rounded-sm bg-turmeric text-forest-dark font-semibold text-base disabled:opacity-50 transition-colors duration-180"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </div>
  );
}

/* ---------- MENU VIEW ---------- */

function MenuView({
  user, cart, setCart, onViewCart,
}: {
  user: UserInfo;
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  onViewCart: () => void;
}) {
  const [menuItems, setMenuItems] = useState<Array<{ id: string; name: string; price: number; category: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useState(() => {
    getMenu({ date: new Date().toISOString().slice(0, 10) }).then((res) => {
      if (res.data) {
        setMenuItems(res.data);
        const cats = Array.from(new Set(res.data.map((m) => m.category))).sort();
        setCategories(cats);
      }
      setLoading(false);
    });
  });

  const filtered = menuItems.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && m.category !== category) return false;
    return true;
  });

  function addToCart(item: typeof menuItems[0]) {
    if (item.status === "habis") return;
    setCart(updateCart(cart, item));
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-3 pt-3 pb-1">
        <input
          type="text"
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-sm border border-line bg-surface text-ink text-sm focus:outline-none focus:border-turmeric"
        />
      </div>
      <div className="flex gap-2 px-3 py-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
            !category ? "bg-forest text-white" : "bg-surface text-muted border border-line"
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              category === c ? "bg-forest text-white" : "bg-surface text-muted border border-line"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-20">
        {loading && <p className="text-center text-muted py-8">Memuat menu...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted py-8">Menu tidak ditemukan</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((item) => {
            const isHabis = item.status === "habis";
            return (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={isHabis}
                className={`relative p-3 rounded-sm text-left transition-all duration-180 active:scale-95 ${
                  isHabis
                    ? "bg-surface/50 border border-line/50 opacity-60"
                    : "bg-surface border border-line active:border-turmeric"
                }`}
                style={{ minHeight: 80 }}
              >
                <p className="text-sm font-semibold text-ink leading-tight mb-1">{item.name}</p>
                <p
                  className="text-xs font-bold text-forest"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatRupiah(item.price)}
                </p>
                {isHabis && (
                  <span className="absolute top-1 right-1 text-[10px] font-medium text-chili">Habis</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface border-t border-line">
          <button
            onClick={onViewCart}
            className="w-full py-3 rounded-sm bg-turmeric text-forest-dark font-semibold flex items-center justify-between px-4"
          >
            <span>🛒 {totalItems} item</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatRupiah(totalPrice)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function updateCart(cart: CartItem[], item: { id: string; name: string; price: number }): CartItem[] {
  const existing = cart.find((c) => c.menu_id === item.id);
  if (existing) {
    return cart.map((c) => (c.menu_id === item.id ? { ...c, qty: c.qty + 1 } : c));
  }
  return [...cart, { menu_id: item.id, name: item.name, price: item.price, qty: 1 }];
}

/* ---------- CART VIEW ---------- */

function CartView({
  cart, setCart, onBack, onDone, user, loading, setLoading,
}: {
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  onBack: () => void;
  onDone: (data: ReceiptData) => void;
  user: UserInfo;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function updateQty(menuId: string, delta: number) {
    setCart(
      cart
        .map((c) => (c.menu_id === menuId ? { ...c, qty: Math.max(1, c.qty + delta) } : c))
        .filter((c) => c.qty > 0)
    );
  }

  async function handleConfirm() {
    if (cart.length === 0) return;
    setLoading(true);
    const id = crypto.randomUUID();
    const result = await createTransaksi({
      id,
      items: cart.map((c) => ({ menu_id: c.menu_id, name: c.name, qty: c.qty, price: c.price })),
      total,
      kasir_id: user.id,
      device_id: deviceId(),
    });
    setLoading(false);
    if (result.data) {
      onDone({
        id: result.data.id,
        invoice: result.data.invoice,
        total: result.data.total,
        items: result.data.items as CartItem[],
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
        <button onClick={onBack} className="text-lg text-muted">&larr;</button>
        <h2 className="font-semibold text-ink">Keranjang</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {cart.map((item) => (
          <div key={item.menu_id} className="flex items-center justify-between bg-surface rounded-sm p-3 border border-line">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink text-sm">{item.name}</p>
              <p className="text-xs text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatRupiah(item.price)}/pcs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQty(item.menu_id, -1)}
                className="w-8 h-8 flex items-center justify-center rounded-sm border border-line text-ink font-bold active:bg-line transition-colors"
              >
                &ndash;
              </button>
              <span className="w-6 text-center font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                {item.qty}
              </span>
              <button
                onClick={() => updateQty(item.menu_id, 1)}
                className="w-8 h-8 flex items-center justify-center rounded-sm bg-turmeric text-forest-dark font-bold active:bg-turmeric-deep transition-colors"
              >
                +
              </button>
            </div>
            <p className="w-20 text-right font-semibold text-ink ml-3" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatRupiah(item.price * item.qty)}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-surface border-t border-line space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink">Total</span>
          <span
            className="text-xl font-bold text-forest"
            style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
          >
            {formatRupiah(total)}
          </span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={loading || cart.length === 0}
          className="w-full py-4 rounded-sm bg-turmeric text-forest-dark font-bold text-lg disabled:opacity-50 transition-colors duration-180 active:bg-turmeric-deep"
          style={{ minHeight: 56 }}
        >
          {loading ? "Memproses..." : "Konfirmasi & Bayar"}
        </button>
      </div>
    </div>
  );
}

/* ---------- RECEIPT VIEW ---------- */

function ReceiptView({
  receipt, onNewTransaction,
}: {
  receipt: ReceiptData;
  onNewTransaction: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="bg-surface rounded-md p-6 w-full max-w-sm border border-line" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2
          className="text-center text-lg font-semibold text-ink mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dapur Kampoeng Raharja
        </h2>
        <p className="text-center text-xs text-muted mb-4">Struk Transaksi</p>

        <div className="border-t border-line pt-4 space-y-2 mb-4">
          {receipt.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-ink">{item.name} x{item.qty}</span>
              <span className="font-medium text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatRupiah(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-3 flex items-center justify-between">
          <span className="font-bold text-ink">Total</span>
          <span
            className="text-xl font-bold text-forest"
            style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
          >
            {formatRupiah(receipt.total)}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-sm bg-forest/5 border border-line text-center">
          <p className="text-xs text-muted mb-1">
            {receipt.invoice ? "Invoice" : "ID Transaksi"}
          </p>
          <p className="text-sm font-bold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
            {receipt.invoice || receipt.id.slice(0, 8).toUpperCase()}
          </p>
          {!receipt.invoice && (
            <p className="text-xs text-chili mt-1">Menunggu sinkronisasi</p>
          )}
        </div>

        <button
          onClick={onNewTransaction}
          className="w-full mt-6 py-3 rounded-sm bg-forest text-white font-semibold text-base transition-colors duration-180 active:bg-forest-dark"
        >
          Transaksi Baru
        </button>
      </div>
    </div>
  );
}
