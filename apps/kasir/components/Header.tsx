"use client";

import { LogOut } from "lucide-react";

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export default function Header({
  userName,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-forest-dark/95 backdrop-blur-md text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/images/logo.png" alt="Dapur Kampoeng" className="h-7 w-auto shrink-0" />
          <span className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>
            Dapur Kampoeng
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70 truncate max-w-[100px]">{userName}</span>
          <div className="w-8 h-8 rounded-full bg-forest-dark/50 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-white/10">
            {userName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={onLogout}
            className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white active:text-white/80 transition-colors duration-180"
            aria-label="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
