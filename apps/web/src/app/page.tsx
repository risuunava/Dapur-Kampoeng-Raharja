"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { getMenu, getCategories, MenuItem } from "../../lib/api";
import { formatRupiah } from "@dapur-kampoeng/utils";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function todayString(): string {
  return formatDate(new Date());
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
    const isHabis = item.status === 'habis' && !upcoming;
    return (
      <div className="bg-surface rounded-xl md:rounded-2xl overflow-hidden shadow-card border border-line/50 group flex flex-col transition-shadow hover:shadow-lg">
        <div className="relative w-full h-28 sm:h-36 md:h-48 bg-line/20 overflow-hidden">
          <img 
            src={item.image_url || getDishImage(item.id)}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isHabis && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-chili text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-lg">Sold Out</span>
            </div>
          )}
          {upcoming && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <span className="bg-turmeric text-forest-dark px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg">
                Siap {formatDateLabel(item.date)}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-ink text-xs md:text-base uppercase tracking-wide truncate mb-1" title={item.name}>{item.name}</h3>
            <p className="text-[10px] md:text-xs text-muted leading-relaxed line-clamp-2 mb-2 md:mb-4">
              {upcoming
                ? `Hidangan ${item.category.toLowerCase()} khas Nusantara, siap ${formatDateLabel(item.date)}.`
                : `Hidangan khas ${item.category.toLowerCase()} yang disiapkan dengan bumbu pilihan Nusantara.`
              }
            </p>
          </div>
          <div className="mt-auto">
            <p className="font-bold text-xs md:text-sm text-ink flex items-baseline gap-1">
              <span className="text-[10px] md:text-xs text-muted font-normal uppercase">Harga:</span> 
              <span className="text-primary">{formatRupiah(item.price)}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchRef = useRef<() => Promise<void>>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getMenu();
    if (result.error) {
      setError(result.error);
      setMenu([]);
    } else {
      const all = result.data || [];
      all.sort((a, b) => a.date.localeCompare(b.date));
      setMenu(all);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRef.current = fetchMenu;
  }, [fetchMenu]);

  useEffect(() => {
    fetchMenu();
    getCategories().then((cats) => setCategories(cats));
  }, [fetchMenu]);

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
