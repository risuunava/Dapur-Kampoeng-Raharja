'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Menu', href: '#menu' },
];

export default function Navbar() {
  const [active, setActive] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);

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
            className="text-lg md:text-2xl font-bold tracking-tight text-primary font-display uppercase hover:opacity-80 transition-opacity"
          >
            Dapur Kampoeng
          </a>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-ink">
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
                    ? 'text-primary border-primary'
                    : 'border-transparent text-ink hover:text-primary hover:border-primary'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-ink active:bg-line transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

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
