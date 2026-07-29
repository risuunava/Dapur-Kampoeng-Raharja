"use client";

import { useState, useEffect, useCallback } from "react";
import { getMenu, getCategories, MenuItem } from "../../lib/api";
import { getLocalDateString } from "@dapur-kampoeng/utils";
import { MenuCard } from "@dapur-kampoeng/ui";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

function formatDate(date: Date): string {
  return getLocalDateString(date);
}

function todayString(): string {
  return getLocalDateString();
}

function formatDateLabel(dateStr: string): string {
  const today = todayString();
  if (dateStr === today) return "Hari ini";
  const date = new Date(dateStr + 'T00:00:00');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (formatDate(tomorrow) === dateStr) return "Besok";
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function isUpcoming(dateStr: string): boolean {
  return dateStr > todayString();
}

const dishImages = [
  '/images/dish_noodle_1784699485646.png',
  '/images/dish_rice_1784699494737.png',
  '/images/dish_satay_1784699504463.png',
  '/images/dish_soup_1784699516279.png',
];

function getDishImage(id: string) {
  const sum = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return dishImages[sum % dishImages.length];
}

function MenuCardItem({ item, upcoming }: { item: MenuItem; upcoming?: boolean }) {
  const itemWithImage = {
    ...item,
    image_url: item.image_url || getDishImage(item.id),
  };

  return (
    <MenuCard
      item={itemWithImage}
      variant="display"
      upcoming={upcoming}
      dateLabel={upcoming ? `Siap ${formatDateLabel(item.date)}` : undefined}
      description={
        upcoming
          ? `Hidangan ${item.category.toLowerCase()} khas Nusantara, siap ${formatDateLabel(item.date)}.`
          : `Hidangan khas ${item.category.toLowerCase()} yang disiapkan dengan bumbu pilihan Nusantara.`
      }
    />
  );
}

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const fetchMenu = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError("");
    const result = await getMenu();
    if (result.error) {
      setError(result.error);
      if (isInitial) setMenu([]);
    } else {
      const all = result.data || [];
      all.sort((a, b) => a.date.localeCompare(b.date));
      setMenu(all);
      setLastUpdated(new Date());
      setElapsed(0);
    }
    if (isInitial) setLoading(false);
  }, []);

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchMenu(true);
    getCategories().then((cats) => setCategories(cats));
    const interval = setInterval(() => fetchMenu(), 30000);
    return () => clearInterval(interval);
  }, [fetchMenu]);

  // Refetch on tab focus
  useEffect(() => {
    const onFocus = () => fetchMenu();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchMenu]);

  // Update elapsed seconds counter
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 10000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const today = todayString();
  const todayMenus = menu.filter((m) => m.date === today);
  const upcomingMenus = menu.filter((m) => isUpcoming(m.date));

  function filterBySearch(items: MenuItem[]) {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }

  const filteredToday = filterBySearch(
    selectedCategory === "All"
      ? todayMenus
      : todayMenus.filter((m) => m.category === selectedCategory)
  );

  const filteredUpcoming = filterBySearch(
    selectedCategory === "All"
      ? upcomingMenus
      : upcomingMenus.filter((m) => m.category === selectedCategory)
  );

  return (
    <div className="min-h-screen">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main>
        <HeroSection />

        <section id="menu" className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-4 md:mb-6">Kategori Menu</h2>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-8 md:mb-16">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                selectedCategory === "All"
                  ? "bg-forest text-white shadow-md"
                  : "bg-surface text-muted hover:text-ink hover:shadow-sm"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-forest text-white shadow-md"
                    : "bg-surface text-muted hover:text-ink hover:shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && <p className="text-center text-muted py-12">Memuat daftar menu...</p>}
          {error && <p className="text-center text-chili py-12">{error}</p>}

          {!loading && !error && filteredToday.length === 0 && filteredUpcoming.length === 0 && (
            <p className="text-center text-muted py-12">Belum ada menu hari ini.</p>
          )}

          {!loading && !error && filteredToday.length > 0 && (
            <>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-4xl font-display font-bold text-ink">Menu Hari Ini</h2>
                <p className="text-xs text-muted mt-2">
                  {lastUpdated && (
                    <span className="inline-flex items-center">
                      Diperbarui {elapsed < 60
                        ? `${elapsed} detik yang lalu`
                        : `${Math.floor(elapsed / 60)} menit yang lalu`}
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-16">
                {filteredToday.map((item) => (
                  <MenuCardItem key={item.id} item={item} />
                ))}
              </div>
            </>
          )}

          {!loading && !error && filteredUpcoming.length > 0 && (
            <>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">Segera</h2>
                <p className="text-muted text-xs md:text-sm mt-2">Menu yang akan hadir di Dapur Kampoeng Raharja</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredUpcoming.map((item) => (
                  <MenuCardItem key={item.id} item={item} upcoming />
                ))}
              </div>
            </>
          )}
        </section>

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}