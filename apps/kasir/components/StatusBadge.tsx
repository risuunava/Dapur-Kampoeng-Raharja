"use client";

import { Clock, LoaderCircle, CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";

type SyncStatus = "pending" | "syncing" | "synced_db" | "synced_sheets" | "failed";

interface StatusBadgeProps {
  status: SyncStatus;
}

const config: Record<SyncStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: {
    label: "Menunggu",
    color: "text-yellow-700 bg-yellow-100 border-yellow-200",
    icon: Clock,
  },
  syncing: {
    label: "Menyinkronkan",
    color: "text-blue-700 bg-blue-100 border-blue-200",
    icon: LoaderCircle,
  },
  synced_db: {
    label: "Tersinkron",
    color: "text-forest bg-forest/10 border-forest/20",
    icon: CheckCircle,
  },
  synced_sheets: {
    label: "Tersinkron",
    color: "text-forest bg-forest/10 border-forest/20",
    icon: CheckCircle,
  },
  failed: {
    label: "Gagal",
    color: "text-chili bg-chili/10 border-chili/20",
    icon: AlertCircle,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${c.color}`}
    >
      <Icon
        className={`w-3 h-3 ${status === "syncing" ? "animate-spin" : ""}`}
      />
      {c.label}
    </span>
  );
}

export function ConnectionBadge({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
        online
          ? "text-green-700 bg-green-100/80"
          : "text-chili bg-chili/10"
      }`}
    >
      {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {online ? "Online" : "Offline"}
    </span>
  );
}
