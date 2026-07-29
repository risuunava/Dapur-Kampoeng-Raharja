"use client";

import { useState, useEffect } from "react";
import { startSyncEngine, stopSyncEngine, subscribe, retryTransaksi } from "../../lib/sync";
import { TransaksiLocal, getAllTransaksiLocal } from "../../lib/local-db";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import BottomTabBar from "../../components/BottomTabBar";
import LoginView from "../../features/auth/components/LoginView";
import MenuView from "../../features/pos/components/MenuView";
import CartView from "../../features/pos/components/CartView";
import ReceiptView from "../../features/pos/components/ReceiptView";
import HistoryView from "../../features/transaksi/components/HistoryView";
import MenuManagement from "../../features/menu/components/MenuManagement";
import DashboardView from "../../features/dashboard/components/DashboardView";

type View = "login" | "menu" | "cart" | "receipt" | "management" | "history" | "dashboard";

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
  sync_status: TransaksiLocal["sync_status"];
}

export default function KasirApp() {
  const [view, setView] = useState<View>("login");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatuses, setSyncStatuses] = useState<Record<string, TransaksiLocal["sync_status"]>>({});
  const [history, setHistory] = useState<TransaksiLocal[]>([]);

  // login form state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);

  // Restore session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser) as UserInfo;
        setUser(u);
        setView("menu");
      } catch {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  // Network listener
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Sync engine
  useEffect(() => {
    if (!user) {
      stopSyncEngine();
      return;
    }
    startSyncEngine();
    const unsub = subscribe((updated) => {
      setSyncStatuses((prev) => ({ ...prev, [updated.id]: updated.sync_status }));
      setHistory((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      if (
        updated.sync_status === "synced_db" &&
        receipt &&
        receipt.id === updated.id
      ) {
        setReceipt((r) =>
          r ? { ...r, invoice: updated.invoice, sync_status: "synced_db" } : r
        );
      }
    });
    return () => {
      unsub();
      stopSyncEngine();
    };
  }, [user, receipt?.id]);

  function handleLoginSuccess(u: UserInfo) {
    setUser(u);
    setView("menu");
    setPin("");
  }

  function handleLogout() {
    stopSyncEngine();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setCart([]);
    setReceipt(null);
    setView("login");
  }

  function handleTransactionDone(data: ReceiptData) {
    setReceipt(data);
    setCart([]);
    setSyncStatuses((prev) => ({ ...prev, [data.id]: data.sync_status }));
    setView("receipt");
  }

  function handleNewTransaction() {
    setView("menu");
  }

  async function openHistory() {
    const all = await getAllTransaksiLocal();
    setHistory(
      all.sort((a, b) => b.created_at.localeCompare(a.created_at))
    );
    setView("history");
  }

  function handleNavigate(target: string) {
    if (target === "history") {
      openHistory();
    } else if (target === "menu") {
      setView("menu");
    } else if (target === "dashboard" && user?.role === "admin") {
      setView("dashboard");
    } else if (target === "management") {
      setView("management");
    }
  }

  const cartItemCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile/tablet */}
      {view !== "login" && user && (
        <div className="hidden lg:flex h-full">
          <Sidebar
            isAdmin={user.role === "admin"}
            isOnline={isOnline}
            currentView={view}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile/Tablet Header */}
        {view !== "login" && user && (
          <div className="lg:hidden">
            <Header
              userName={user.name}
              isOnline={isOnline}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* Desktop Header */}
        {view !== "login" && user && (
          <header className="h-20 border-b border-line/50 flex items-center justify-between px-8 bg-bg/90 backdrop-blur-md shrink-0 hidden lg:flex sticky top-0 z-50">
            <div>
              <p className="text-sm text-muted font-medium">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h2 className="text-xl font-display font-bold text-ink">Welcome, {user.name}!</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-ink">{user.name}</span>
                <span className="text-xs text-muted capitalize">{user.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold text-lg shadow-sm border border-forest-dark/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
        )}

        {/* Content + Cart */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Middle Content */}
          <div className="flex-1 overflow-y-auto bg-bg flex flex-col">
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

            {view === "receipt" && receipt && (
              <ReceiptView
                receipt={receipt}
                onNewTransaction={handleNewTransaction}
                onRetry={
                  receipt.sync_status === "failed" || receipt.sync_status === "pending"
                    ? () => retryTransaksi(receipt.id)
                    : undefined
                }
              />
            )}

            {view === "management" && user && (
              <div className="p-6 h-full">
                <MenuManagement onBack={() => setView("menu")} />
              </div>
            )}

            {view === "dashboard" && user?.role === "admin" && (
              <div className="p-6 h-full">
                <DashboardView onBack={() => setView("menu")} />
              </div>
            )}

            {view === "history" && user && (
              <div className="p-6 h-full">
                <HistoryView
                  history={history}
                  syncStatuses={syncStatuses}
                  onRetry={retryTransaksi}
                  onBack={() => setView("menu")}
                  onRefresh={openHistory}
                />
              </div>
            )}
          </div>

          {/* Right Cart Sidebar (Visible on desktop when in menu and cart is not empty) */}
          {view === "menu" && user && cart.length > 0 && (
            <div className="w-[400px] bg-surface border-l border-line/50 hidden lg:flex flex-col shrink-0 h-full overflow-hidden animate-slide-left shadow-xl shadow-ink/5 z-40">
              <CartView
                cart={cart}
                setCart={setCart}
                onBack={() => {}} // Not needed on desktop
                onDone={handleTransactionDone}
                user={user}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
          )}

          {/* Mobile Cart View (Full Screen) — hides bottom tab */}
          {view === "cart" && user && (
            <div className="absolute inset-0 bg-surface z-50 flex flex-col lg:hidden">
              <CartView
                cart={cart}
                setCart={setCart}
                onBack={() => setView("menu")}
                onDone={handleTransactionDone}
                user={user}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
          )}
        </div>

        {/* Bottom Tab Bar — mobile/tablet only */}
        {view !== "login" && view !== "cart" && user && (
          <BottomTabBar
            currentView={view}
            isAdmin={user.role === "admin"}
            cartItemCount={cartItemCount}
            onNavigate={handleNavigate}
          />
        )}
      </main>
    </div>
  );
}
