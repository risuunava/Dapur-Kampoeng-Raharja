"use client";

import { formatRupiah } from "@dapur-kampoeng/utils";

interface MenuItemData {
  id: string;
  name: string;
  price: number;
  category: string;
  status: string;
  image_url?: string | null;
}

interface MenuCardProps {
  item: MenuItemData;
  onSelect: (item: MenuItemData) => void;
}

export default function MenuCard({ item, onSelect }: MenuCardProps) {
  const isHabis = item.status === "habis";

  return (
    <button
      onClick={() => onSelect(item)}
      disabled={isHabis}
      className={`relative rounded-md text-left transition-all duration-180 overflow-hidden ${
        isHabis
          ? "bg-surface/50 border border-line/50 opacity-60 cursor-not-allowed"
          : "bg-surface border border-line hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] active:border-turmeric cursor-pointer"
      }`}
      style={{ boxShadow: "var(--shadow-card)", minHeight: 128 }}
    >
      {item.image_url && (
        <div className="w-full h-20 overflow-hidden bg-bg">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-2.5">
        <p className="text-sm font-semibold text-ink leading-tight mb-1 line-clamp-2">
          {item.name}
        </p>
        <p
          className="text-xs font-bold text-forest"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatRupiah(item.price)}
        </p>
      </div>

      {isHabis && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute bg-chili/70"
              style={{
                top: 0,
                left: "-10%",
                width: "120%",
                height: 2,
                transform: "rotate(-18deg)",
                transformOrigin: "center",
                boxShadow: "0 0 4px rgba(179, 58, 46, 0.3)",
              }}
            />
          </div>
          <span className="absolute top-1.5 right-1.5 text-[10px] font-bold text-chili bg-surface/80 px-1.5 py-0.5 rounded-sm border border-chili/30">
            Habis
          </span>
        </>
      )}
    </button>
  );
}
