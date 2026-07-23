'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Menu', href: '#menu' },
];

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Navbar({ searchQuery = '', onSearchChange }: NavbarProps) {
  const [active, setActive] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sectionIds = ['hero', 'menu', 'about', 'contact'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(id);
          }
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive('menu');
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    setActive(id);
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line/50 w-full">
      <nav className="flex items-center justify-between py-3 px-4 md:py-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo.png" alt="Dapur Kampoeng" className="h-7 md:h-9 w-auto" />
            <span className="text-base md:text-xl font-bold tracking-tight text-forest-dark font-display uppercase">
              Dapur Kampoeng Raharja
            </span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-ink">
          {navLinks.map((link) => {
            const id = link.href.replace('#', '');
            const isActive = active === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`transition-colors pb-1 border-b-2 ${
                  isActive
                    ? 'text-forest border-forest'
                    : 'border-transparent text-ink hover:text-forest hover:border-forest'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:relative md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={scrollToMenu}
              className="w-48 lg:w-56 pl-9 pr-3 py-2 rounded-full border border-line bg-surface text-sm text-ink focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest/30 transition-all duration-180"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => { setSearchOpen(!searchOpen); scrollToMenu(); }}
            className="md:hidden w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-ink active:bg-line transition-colors"
            aria-label="Search menu"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-ink active:bg-line transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden border-t border-line/50 bg-bg px-4 py-3 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-line bg-surface text-sm text-ink focus:outline-none focus:border-forest transition-all duration-180"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="md:hidden border-t border-line/50 bg-bg px-4 py-4 space-y-3">
          {navLinks.map((link) => {
            const id = link.href.replace('#', '');
            const isActive = active === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-forest/10 text-forest'
                    : 'text-ink hover:bg-surface'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
