import { formatRupiah } from "@dapur-kampoeng/utils";

interface PriceTextProps {
  amount: number;
  className?: string;
}

export default function PriceText({ amount, className = "" }: PriceTextProps) {
  return (
    <span
      className={`tabular-nums ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {formatRupiah(amount)}
    </span>
  );
}
