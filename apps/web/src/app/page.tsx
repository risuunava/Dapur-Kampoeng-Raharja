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

// Map ID to an image for demo purposes
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

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchRef = useRef<() => Promise<void>>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getMenu({ date: todayString() });
    if (result.error) {
      setError(result.error);
      setMenu([]);
    } else {
      setMenu(result.data || []);
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

  const filtered = selectedCategory === "All"
    ? menu
    : menu.filter((m) => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <main>
        <HeroSection />

        <section id="menu" className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <h2 className="text-3xl font-display font-bold text-ink mb-6">Kategori Menu</h2>
          
          <div className="flex flex-wrap items-center gap-4 mb-16">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-colors ${
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
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-forest text-white shadow-md"
                    : "bg-surface text-muted hover:text-ink hover:shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-ink">Menu Hari Ini</h2>
          </div>

          {loading && <p className="text-center text-muted py-12">Memuat daftar menu...</p>}
          {error && <p className="text-center text-chili py-12">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filtered.map((item) => (
                <div key={item.id} className="bg-surface rounded-2xl overflow-hidden shadow-card border border-line/50 group flex flex-col transition-shadow hover:shadow-lg">
                  <div className="relative w-full h-48 bg-line/20 overflow-hidden">
                    <img 
                      src={item.image_url || getDishImage(item.id)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.status === 'habis' && (
                      <div className="absolute inset-0 bg-ink/50 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-chili text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-ink text-base uppercase tracking-wide truncate mb-1" title={item.name}>{item.name}</h3>
                      <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4">
                        Hidangan khas {item.category.toLowerCase()} yang disiapkan dengan bumbu pilihan Nusantara.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <p className="font-bold text-sm text-ink flex items-baseline gap-1">
                        <span className="text-xs text-muted font-normal uppercase">Harga:</span> 
                        <span className="text-primary">{formatRupiah(item.price)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}
