"use client";

import { LogOut, LayoutDashboard, ClipboardList, UtensilsCrossed } from "lucide-react";
import { ConnectionBadge } from "./StatusBadge";
import Button from "./Button";

interface HeaderProps {
  userName: string;
  isOnline: boolean;
  isAdmin: boolean;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export default function Header({
  userName,
  isOnline,
  isAdmin,
  currentView,
  onNavigate,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-forest-dark/95 backdrop-blur-md text-white">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/images/logo.png" alt="Dapur Kampoeng" className="h-6 w-auto shrink-0" />
          <span
            className="text-base font-semibold truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dapur Kampoeng
          </span>
          <ConnectionBadge online={isOnline} />
        </div>

        <div className="flex items-center gap-1">
          <span className="hidden sm:inline text-[11px] text-white/60 mr-1 truncate max-w-[80px]">
            {userName}
          </span>

          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() =>
                onNavigate(currentView === "dashboard" ? "menu" : "dashboard")
              }
              className="!text-[11px] !px-2 !py-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">
                {currentView === "dashboard" ? "Transaksi" : "Dashboard"}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => onNavigate("history")}
            className="!text-[11px] !px-2 !py-1"
          >
            <ClipboardList className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Riwayat</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              onNavigate(currentView === "management" ? "menu" : "management")
            }
            className="!text-[11px] !px-2 !py-1"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline">
              {currentView === "management" ? "Transaksi" : "Atur Menu"}
            </span>
          </Button>

          <Button
            variant="ghost"
            onClick={onLogout}
            className="!text-[11px] !px-2 !py-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
