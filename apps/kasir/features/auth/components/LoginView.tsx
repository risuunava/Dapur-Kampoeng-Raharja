"use client";

import { login as apiLogin } from "../../../lib/api";
import { LogIn, Delete } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  role: string;
}

interface LoginViewProps {
  username: string;
  setUsername: (v: string) => void;
  pin: string;
  setPin: (v: string) => void;
  error: string;
  setError: (v: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  onSuccess: (user: UserInfo) => void;
}

export default function LoginView({
  username, setUsername, pin, setPin,
  error, setError, loading, setLoading, onSuccess,
}: LoginViewProps) {
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
      sessionStorage.setItem('user', JSON.stringify(result.data.user));
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
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-bg">
      {/* Kiri - Branding */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-forest flex-col justify-center px-12 lg:px-20 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-black/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
            <img src="/images/logo.png" alt="Dapur Kampoeng" className="h-10 w-auto" />
            <span className="text-2xl font-bold tracking-tight text-white font-display uppercase">Dapur Kampoeng</span>
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-display font-bold text-white leading-tight mb-6">
            Sistem Kasir Pintar untuk Layanan Terpercaya.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Kelola pesanan, riwayat transaksi, dan menu dengan cepat dan mudah dalam satu aplikasi.
          </p>
        </div>
        
        <div className="absolute bottom-8 left-12 lg:left-20 flex gap-6 text-sm text-white/50">
          <span>Terms of service</span>
          <span>Privacy policy</span>
        </div>
      </div>

      {/* Kanan - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-20 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <div className="md:hidden flex items-center justify-center gap-2 mb-6">
              <img src="/images/logo.png" alt="Dapur Kampoeng" className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight text-forest-dark font-display uppercase">Dapur Kampoeng</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-ink mb-2">Selamat Datang</h2>
            <p className="text-muted">Silakan masukkan username dan PIN Anda</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink text-base focus:outline-none focus:border-turmeric focus:ring-1 focus:ring-turmeric/30 transition-all duration-180"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-3">PIN Akses</label>
              <div className="flex items-center gap-3 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-180 ${
                      i < pin.length
                        ? "bg-forest scale-110"
                        : "bg-line/30"
                    }`}
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-3 w-full">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button
                    key={d}
                    onClick={() => handlePinInput(d)}
                    className="h-14 text-xl font-bold bg-bg border border-line rounded-xl active:bg-line active:scale-95 transition-all duration-180 hover:border-forest/30"
                  >
                    {d}
                  </button>
                ))}
                <div className="h-14"></div>
                <button
                  onClick={() => handlePinInput("0")}
                  className="h-14 text-xl font-bold bg-bg border border-line rounded-xl active:bg-line active:scale-95 transition-all duration-180 hover:border-forest/30"
                >
                  0
                </button>
                <button
                  onClick={handlePinBack}
                  className="h-14 text-lg text-muted bg-bg border border-line rounded-xl active:bg-line active:scale-95 transition-all duration-180 flex items-center justify-center hover:text-chili hover:border-chili/30"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-chili/10 text-chili text-sm rounded-lg animate-fade-in border border-chili/20">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || pin.length < 4}
              className="w-full py-4 mt-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-base disabled:opacity-50 transition-all duration-180 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-forest/20"
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
                "Masuk Sekarang"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
