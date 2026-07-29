"use client";

import { useState, useEffect, useCallback } from "react";
import { getMenu } from "../../../lib/api";
import { getLocalDateString } from "@dapur-kampoeng/utils";
import type { Menu } from "@dapur-kampoeng/types";
import { ShoppingCart } from "lucide-react";
import SearchInput from "../../../components/SearchInput";
import CategoryChip from "../../../components/CategoryChip";
import { MenuCard, type MenuItemData } from "@dapur-kampoeng/ui";

interface CartItem {
  menu_id: string;
  name: string;
  price: number;
  qty: number;
}

interface MenuViewProps {
  user: { id: string; name: string; role: string };
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  onViewCart: () => void;
}

function updateCart(cart: CartItem[], item: Menu): CartItem[] {
  const existing = cart.find((c) => c.menu_id === item.id);
  if (existing) {
    return cart.map((c) =>
      c.menu_id === item.id ? { ...c, qty: c.qty + 1 } : c
    );
  }
  return [...cart, { menu_id: item.id, name: item.name, price: item.price, qty: 1 }];
}

export default function MenuView({
  cart, setCart, onViewCart,
}: MenuViewProps) {
  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchMenu = useCallback(async () => {
    const res = await getMenu({ date: getLocalDateString() });
    if (res.data) {
      setMenuItems(res.data);
      const cats = Array.from(new Set(res.data.map((m) => m.category))).sort();
      setCategories(cats);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Initial fetch & auto-refresh every 30s
  useEffect(() => {
    fetchMenu();
    const interval = setInterval(fetchMenu, 30000);
    return () => clearInterval(interval);
  }, [fetchMenu]);

  // Refetch on focus (tab becomes active again)
  useEffect(() => {
    const onFocus = () => fetchMenu();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchMenu]);

  function handleRefresh() {
    setRefreshing(true);
    fetchMenu();
  }

  const filtered = menuItems.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && m.category !== category) return false;
    return true;
  });

  function handleSelect(item: MenuItemData) {
    if (item.status === "habis") return;
    setCart(updateCart(cart, item as Menu));
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="flex-1 flex flex-col p-6 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">Semua Menu</h2>
          <p className="text-sm md:text-base text-muted mt-1">Pilih menu untuk pesanan pelanggan</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-5 py-3 rounded-full border border-line bg-surface text-sm font-medium text-ink hover:text-forest hover:border-forest transition-colors duration-180 disabled:opacity-50 shadow-sm min-h-[44px]"
          >
            {refreshing ? "Memuat..." : "Muat ulang"}
          </button>
          <div className="w-full md:w-72">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari menu..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-thin">
        <CategoryChip
          label="Semua"
          active={!category}
          onClick={() => setCategory("")}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c}
            label={c}
            active={category === c}
            onClick={() => setCategory(c)}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {loading && (
          <div className="grid grid-cols-3 gap-2 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-md bg-surface border border-line overflow-hidden animate-pulse-soft"
                style={{ minHeight: 128 }}
              >
                <div className="w-full h-20 bg-line/50" />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-line/50 rounded w-3/4" />
                  <div className="h-3 bg-line/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <ShoppingCart className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Menu tidak ditemukan</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} onSelect={handleSelect} />
          ))}
        </div>
      </div>

    </div>
  );
}
