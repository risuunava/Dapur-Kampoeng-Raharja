"use client";

import { useState } from "react";
import { getMenu } from "../../../lib/api";
import { formatRupiah } from "@dapur-kampoeng/utils";
import { ShoppingCart } from "lucide-react";
import SearchInput from "../../../components/SearchInput";
import CategoryChip from "../../../components/CategoryChip";
import MenuCard from "../../../components/MenuCard";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: string;
  image_url?: string | null;
}

interface CartItem {
  menu_id: string;
  name: string;
  price: number;
  qty: number;
}

interface UserInfo {
  id: string;
  name: string;
  role: string;
}

interface MenuViewProps {
  user: UserInfo;
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  onViewCart: () => void;
}

function updateCart(cart: CartItem[], item: { id: string; name: string; price: number }): CartItem[] {
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Initial fetch — runs once on mount
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

  function handleSelect(item: MenuItem) {
    if (item.status === "habis") return;
    setCart(updateCart(cart, item));
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-ink">Semua Menu</h2>
          <p className="text-sm text-muted">Pilih menu untuk pesanan pelanggan</p>
        </div>
        <div className="w-64">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari menu..."
          />
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} onSelect={handleSelect} />
          ))}
        </div>
      </div>

    </div>
  );
}
