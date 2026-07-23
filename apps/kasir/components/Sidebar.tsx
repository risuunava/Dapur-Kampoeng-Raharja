"use client";

import { LogOut, LayoutDashboard, ClipboardList, UtensilsCrossed, Store } from "lucide-react";
import { ConnectionBadge } from "./StatusBadge";

interface SidebarProps {
  isAdmin: boolean;
  isOnline: boolean;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  isAdmin,
  isOnline,
  currentView,
  onNavigate,
  onLogout,
}: SidebarProps) {
  
  const menuItems = [
    ...(isAdmin ? [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    { id: "menu", label: "POS / Order", icon: Store },
    { id: "history", label: "Riwayat", icon: ClipboardList },
    { id: "management", label: "Atur Menu", icon: UtensilsCrossed },
  ];

  return (
    <aside className="w-64 bg-surface h-screen flex flex-col border-r border-line/50 shrink-0">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-line/30">
        <img src="/images/logo.png" alt="Dapur Kampoeng" className="h-8 w-auto" />
        <span
          className="text-xl font-bold tracking-tight text-forest-dark truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dapur Kampoeng
        </span>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4 px-2">Menu</p>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-180 text-sm font-semibold w-full text-left
                    ${isActive 
                      ? "bg-forest text-white shadow-md shadow-forest/20" 
                      : "text-muted hover:bg-bg hover:text-ink"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Status */}
      <div className="p-6 border-t border-line/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Status</span>
          <ConnectionBadge online={isOnline} />
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-180 text-sm font-semibold w-full text-left text-chili hover:bg-chili/10"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
