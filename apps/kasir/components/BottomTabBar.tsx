"use client";

import { Store, ClipboardList, UtensilsCrossed, LayoutDashboard } from "lucide-react";

interface BottomTabBarProps {
  currentView: string;
  isAdmin: boolean;
  cartItemCount: number;
  onNavigate: (view: string) => void;
}

const tabs = [
  { id: "menu", label: "Pesanan", icon: Store, adminOnly: false },
  { id: "history", label: "Riwayat", icon: ClipboardList, adminOnly: false },
  { id: "management", label: "Menu", icon: UtensilsCrossed, adminOnly: false },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: true },
];

export default function BottomTabBar({ currentView, isAdmin, cartItemCount, onNavigate }: BottomTabBarProps) {
  const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin);
  const activeTab = currentView === "receipt" ? "menu" : currentView;

  return (
    <nav className="lg:hidden h-16 bg-surface border-t border-line flex items-center justify-around pb-1 safe-area-bottom z-40 shrink-0">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="relative flex flex-col items-center justify-center gap-0.5 h-full min-w-[56px] flex-1 max-w-[96px] active:scale-95 transition-transform duration-150"
          >
            <div className="relative">
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-forest rounded-full" />
              )}
              <Icon className={`w-6 h-6 ${isActive ? "text-forest" : "text-muted"}`} />
              {tab.id === "menu" && cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-chili text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold leading-none ${isActive ? "text-forest" : "text-muted"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
