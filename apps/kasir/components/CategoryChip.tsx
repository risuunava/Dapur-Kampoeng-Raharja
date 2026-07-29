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
      className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-180 active:scale-95 ${
        active
          ? "bg-forest text-white shadow-md"
          : "bg-surface text-muted border border-line hover:border-forest hover:text-ink hover:shadow-sm active:bg-line"
      }`}
    >
      {label}
    </button>
  );
}
