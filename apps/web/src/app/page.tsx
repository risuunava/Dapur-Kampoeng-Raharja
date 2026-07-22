"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getMenu, getCategories, MenuItem } from "../../lib/api";
import { formatRupiah } from "@dapur-kampoeng/utils";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function todayString(): string {
  return formatDate(new Date());
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

function tomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

function labelDate(dateStr: string): string {
  const today = todayString();
  const yesterday = yesterdayString();
  const tomorrow = tomorrowString();
  if (dateStr === today) return "Hari ini";
  if (dateStr === yesterday) return "Kemarin";
  if (dateStr === tomorrow) return "Besok";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 10) return "baru saja";
  if (diff < 60) return `${diff} detik lalu`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} menit lalu`;
  return `${Math.floor(mins / 60)} jam lalu`;
}

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetchRef = useRef<() => Promise<void>>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getMenu({ date: selectedDate });
    if (result.error) {
      setError(result.error);
      setMenu([]);
    } else {
      setMenu(result.data || []);
    }
    setLastUpdated(new Date());
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchRef.current = fetchMenu;
  }, [fetchMenu]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    getCategories().then((cats) => setCategories(cats));
  }, []);

  useEffect(() => {
    const poll = setInterval(() => {
      fetchRef.current?.();
    }, 30000);

    function onVisible() {
      if (document.visibilityState === "visible") {
        fetchRef.current?.();
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const filtered = selectedCategory
    ? menu.filter((m) => m.category === selectedCategory)
    : menu;

  const recommended = filtered.filter((m) => m.status === "tersedia").slice(0, 2);

  const datePresets = [
    { label: "Kemarin", value: yesterdayString() },
    { label: "Hari ini", value: todayString() },
    { label: "Besok", value: tomorrowString() },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-forest-dark text-white px-4 py-6">
        <h1
          className="text-2xl font-semibold mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dapur Kampoeng Raharja
        </h1>
        <p className="text-sm text-white/80">Menu hari ini</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-white/70">
            {loading
              ? "Memuat..."
              : lastUpdated
                ? `${menu.length} menu · diperbarui ${timeAgo(lastUpdated)}`
                : `${menu.length} menu`}
          </span>
        </div>
      </header>

      <main className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {datePresets.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedDate(p.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-180 ${
                selectedDate === p.value
                  ? "bg-turmeric text-forest-dark"
                  : "bg-surface text-muted border border-line hover:border-turmeric"
              }`}
            >
              {p.label}
            </button>
          ))}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-full text-sm border border-line bg-surface text-ink cursor-pointer"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-180 ${
                !selectedCategory
                  ? "bg-forest text-white"
                  : "bg-surface text-muted border border-line"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-180 ${
                  selectedCategory === cat
                    ? "bg-forest text-white"
                    : "bg-surface text-muted border border-line"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-chili mb-2">{error}</p>
            <button
              onClick={fetchMenu}
              className="px-4 py-2 rounded-full bg-turmeric text-forest-dark text-sm font-medium"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="text-center py-12 text-muted">Memuat menu...</div>
        )}

        {!error && !loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted mb-2">
              Menu hari ini belum diunggah. Coba cek lagi nanti, atau lihat menu kemarin.
            </p>
            <button
              onClick={() => setSelectedDate(yesterdayString())}
              className="px-4 py-2 rounded-full bg-turmeric text-forest-dark text-sm font-medium"
            >
              Lihat menu kemarin
            </button>
          </div>
        )}

        {!error && !loading && recommended.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>Direkomendasikan</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {recommended.map((item) => (
                <MenuCard key={item.id} item={item} featured />
              ))}
            </div>
          </section>
        )}

        {!error && !loading && filtered.length > 0 && (
          <section>
            {!recommended.length && (
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Semua Menu
              </h2>
            )}
            <div className="space-y-2">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function MenuCard({ item, featured }: { item: MenuItem; featured?: boolean }) {
  const isHabis = item.status === "habis";

  return (
    <div
      className={`relative bg-surface rounded-md overflow-hidden transition-shadow duration-180 ${
        featured ? "shadow-card" : "shadow-card"
      }`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold truncate ${
                featured ? "text-base" : "text-base"
              } ${isHabis ? "text-muted" : "text-ink"}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {item.name}
            </h3>
            <p className="text-sm font-bold text-ink mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatRupiah(item.price)}
            </p>
          </div>
        </div>
        <div className="mt-2">
          {isHabis ? (
            <span className="inline-block text-xs font-medium text-chili bg-chili/10 px-2 py-0.5 rounded">
              Habis
            </span>
          ) : (
            <span className="inline-block text-xs font-medium text-forest bg-forest/10 px-2 py-0.5 rounded">
              Tersedia
            </span>
          )}
        </div>
        {featured && !isHabis && (
          <div className="mt-2 h-0.5 w-12 rounded-full bg-turmeric" />
        )}
      </div>
      {isHabis && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(179,58,46,0.06) 8px, rgba(179,58,46,0.06) 10px)",
          }}
        />
      )}
    </div>
  );
}
