"use client";

import { formatRupiah } from "@dapur-kampoeng/utils";

export interface MenuItemData {
  id: string;
  name: string;
  price: number;
  category: string;
  status: string;
  date?: string;
  image_url?: string | null;
}

interface MenuCardProps {
  item: MenuItemData;
  variant?: "compact" | "display";
  onSelect?: (item: MenuItemData) => void;
  upcoming?: boolean;
  dateLabel?: string;
  description?: string;
}

export default function MenuCard({
  item,
  variant = "compact",
  onSelect,
  upcoming,
  dateLabel,
  description,
}: MenuCardProps) {
  const soldOut = item.status === "habis" && !upcoming;

  if (variant === "display") {
    return (
      <div className="bg-surface rounded-xl md:rounded-2xl overflow-hidden shadow-card border border-line/50 flex flex-col transition-shadow hover:shadow-lg">
        <div className="relative w-full h-32 sm:h-40 md:h-52 bg-line/20 overflow-hidden">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          )}
          {soldOut && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-chili text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-lg">
                Habis
              </span>
            </div>
          )}
          {upcoming && dateLabel && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <span className="bg-turmeric text-forest-dark px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg">
                {dateLabel}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 md:p-6 flex-1 flex flex-col justify-between bg-white">
          <div className="mb-4">
            <h3 className="font-extrabold text-ink text-sm md:text-lg uppercase tracking-wider mb-2 line-clamp-2" title={item.name}>
              {item.name}
            </h3>
            {description && (
              <p className="text-xs md:text-sm text-muted leading-relaxed line-clamp-3">
                {description}
              </p>
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-line/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-muted font-semibold uppercase tracking-widest">Harga</span>
              <span className="font-bold text-sm md:text-lg text-forest tabular-nums">{formatRupiah(item.price)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect?.(item)}
      disabled={soldOut}
      className={`relative rounded-md text-left transition-shadow duration-180 overflow-hidden ${
        soldOut
          ? "bg-surface/50 border border-line/50 opacity-60 cursor-not-allowed"
          : "bg-surface border border-line hover:shadow-md active:border-turmeric cursor-pointer"
      }`}
      style={{ boxShadow: "var(--shadow-card)", minHeight: 128 }}
    >
      {item.image_url && (
        <div className="w-full h-24 md:h-32 overflow-hidden bg-bg">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3 md:p-4 flex flex-col justify-between bg-white h-full">
        <p className="text-sm md:text-base font-bold text-ink leading-tight mb-2 line-clamp-2">
          {item.name}
        </p>
        <p className="text-sm font-extrabold text-forest tabular-nums mt-auto">
          {formatRupiah(item.price)}
        </p>
      </div>

      {soldOut && (
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
