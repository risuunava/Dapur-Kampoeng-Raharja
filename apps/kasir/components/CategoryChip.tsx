"use client";

interface CategoryChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-180 active:scale-95 ${
        active
          ? "bg-forest text-white shadow-sm"
          : "bg-surface text-muted border border-line hover:border-forest/30 active:bg-line"
      }`}
    >
      {label}
    </button>
  );
}
