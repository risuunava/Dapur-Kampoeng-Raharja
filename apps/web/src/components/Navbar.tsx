import Link from 'next/link';
import { Search, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-4 px-4 md:py-6 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-xl md:text-2xl font-bold tracking-tight text-primary font-display uppercase">Dapur Kampoeng</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-ink">
        <Link href="/" className="hover:text-primary transition-colors pb-1 border-b-2 border-primary">Home</Link>
        <Link href="#menu" className="hover:text-primary transition-colors pb-1 border-b-2 border-transparent hover:border-primary">Menu</Link>
        <Link href="#about" className="hover:text-primary transition-colors pb-1 border-b-2 border-transparent hover:border-primary">About</Link>
        <Link href="#contact" className="hover:text-primary transition-colors pb-1 border-b-2 border-transparent hover:border-primary">Contact</Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-8 pr-4 py-2 rounded-full border border-line bg-surface text-sm focus:outline-none focus:border-primary w-48"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
        </div>
        <button className="md:hidden w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-ink">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
